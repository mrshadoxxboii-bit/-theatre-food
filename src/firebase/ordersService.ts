import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  Unsubscribe,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, firestoreDatabaseId } from './config';
import { Order, OrderStatus, normalizeOrderStatus } from '../types';

export const ORDERS_COLLECTION = 'orders';
export const ORDERS_COLLECTION_UPPER = 'ORDERS';

/**
 * Creates a NEW order document in the existing Firestore ORDERS collection.
 * Does NOT delete or modify any existing historical documents.
 * Stores: items, quantity, price, total, status, orderStatus, createdAt, seat, screen, customer details.
 */
export async function createFirestoreOrder(order: Order): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, order.orderId);
  const upperDocRef = doc(db, ORDERS_COLLECTION_UPPER, order.orderId);

  // Deep sanitize items list matching existing project schema
  const sanitizedItems = (order.items || []).map((item) => ({
    productId: String(item.productId || ''),
    name: String(item.name || 'Item'),
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    total: Number(item.total) || (Number(item.price) || 0) * (Number(item.quantity) || 1),
    isVeg: Boolean(item.isVeg),
  }));

  const totalQuantity = sanitizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const customerName = String(order.customerName || order.customerDetails?.name || 'Guest Patron').trim();
  const phoneNumber = String(order.phoneNumber || order.customerDetails?.phone || '').trim();
  const resolvedScreen = String(order.screenNumber || '1').trim();
  const resolvedSeat = String(order.seatNumber || 'B12').trim().toUpperCase();
  const resolvedStatus = normalizeOrderStatus(order.orderStatus || order.status || 'Pending');
  const numericTotal = Number(order.totalAmount) || Number(order.total) || 0;
  const numericSubtotal = Number(order.subtotal) || numericTotal;
  const numericTax = Number(order.taxAmount) || 0;

  const payload = {
    orderId: String(order.orderId),
    customerName,
    phoneNumber,
    customerDetails: {
      name: customerName,
      phone: phoneNumber,
    },
    theatreName: String(order.theatreName || 'Namma Cinemas (Express Screen)'),
    screenNumber: resolvedScreen,
    theatreScreen: `Screen ${resolvedScreen}`,
    seatNumber: resolvedSeat,
    items: sanitizedItems,
    quantity: totalQuantity,
    price: numericSubtotal,
    subtotal: numericSubtotal,
    taxAmount: numericTax,
    totalAmount: numericTotal,
    total: numericTotal,
    orderStatus: resolvedStatus,
    status: resolvedStatus,
    paymentStatus: order.paymentStatus || 'demo_paid',
    paymentMethod: String(order.paymentMethod || 'UPI (GPAY)'),
    createdAt: order.createdAt || new Date().toISOString(),
    customerNotes: order.customerNotes ? String(order.customerNotes).trim() : '',
  };

  try {
    console.log(`[Firestore] Creating new order document ${order.orderId} in database ${firestoreDatabaseId}/${ORDERS_COLLECTION}...`);
    // Write new document to existing orders collection
    await setDoc(docRef, payload);

    // Also write to ORDERS (uppercase) for dual-case compatibility
    try {
      await setDoc(upperDocRef, payload);
    } catch {
      // Non-fatal if upper collection has different rule
    }

    console.log(`[Firestore] Successfully saved new order ${order.orderId} to existing ORDERS collection!`);
  } catch (error) {
    console.error(`[Firestore] Failed to save order ${order.orderId}:`, error);
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.orderId}`);
  }
}

/**
 * Updates the orderStatus and status of an order in Firestore.
 * Supports: Pending | Preparing | Ready | Delivered | Cancelled
 */
export async function updateFirestoreOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  try {
    await updateDoc(docRef, {
      orderStatus: newStatus,
      status: newStatus,
    });
    console.log(`[Firestore] Updated order ${orderId} status to '${newStatus}'`);
  } catch (error) {
    console.warn(`[Firestore] Failed to update in ${ORDERS_COLLECTION}, trying ${ORDERS_COLLECTION_UPPER}:`, error);
    try {
      const upperDocRef = doc(db, ORDERS_COLLECTION_UPPER, orderId);
      await updateDoc(upperDocRef, {
        orderStatus: newStatus,
        status: newStatus,
      });
    } catch {
      handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
    }
  }
}

/**
 * Real-time listener for all orders from the existing Firestore ORDERS collection.
 * Preserves all historical documents without deleting or modifying them.
 */
export function subscribeToAllOrders(
  onOrders: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, ORDERS_COLLECTION);
  const q = query(colRef);

  return onSnapshot(
    q,
    async (snapshot) => {
      const ordersMap = new Map<string, Order>();

      snapshot.forEach((d) => {
        const data = d.data();
        const id = data.orderId || d.id;
        const normalizedSt = normalizeOrderStatus(data.orderStatus || data.status);
        const resolvedTotal = Number(data.totalAmount) || Number(data.total) || 0;

        ordersMap.set(id, {
          orderId: id,
          customerName: data.customerName || data.customerDetails?.name || undefined,
          phoneNumber: data.phoneNumber || data.customerDetails?.phone || undefined,
          customerDetails: data.customerDetails || (data.customerName ? { name: data.customerName, phone: data.phoneNumber || '' } : undefined),
          seatNumber: data.seatNumber || '',
          screenNumber: data.screenNumber || '1',
          theatreName: data.theatreName || 'Namma Cinemas (Express Screen)',
          items: Array.isArray(data.items) ? data.items : [],
          subtotal: Number(data.subtotal) || Number(data.price) || resolvedTotal,
          taxAmount: Number(data.taxAmount) || 0,
          totalAmount: resolvedTotal,
          total: resolvedTotal,
          orderStatus: normalizedSt,
          status: normalizedSt,
          paymentStatus: data.paymentStatus || 'demo_paid',
          paymentMethod: data.paymentMethod || 'UPI (GPAY)',
          createdAt: data.createdAt || new Date().toISOString(),
          customerNotes: data.customerNotes || undefined,
        });
      });

      // Also check if any orders exist in uppercase ORDERS collection to merge them
      try {
        const upperSnap = await getDocs(collection(db, ORDERS_COLLECTION_UPPER));
        if (!upperSnap.empty) {
          upperSnap.forEach((d) => {
            const data = d.data();
            const id = data.orderId || d.id;
            if (!ordersMap.has(id)) {
              const normalizedSt = normalizeOrderStatus(data.orderStatus || data.status);
              const resolvedTotal = Number(data.totalAmount) || Number(data.total) || 0;

              ordersMap.set(id, {
                orderId: id,
                customerName: data.customerName || data.customerDetails?.name || undefined,
                phoneNumber: data.phoneNumber || data.customerDetails?.phone || undefined,
                customerDetails: data.customerDetails,
                seatNumber: data.seatNumber || '',
                screenNumber: data.screenNumber || '1',
                theatreName: data.theatreName || 'Namma Cinemas (Express Screen)',
                items: Array.isArray(data.items) ? data.items : [],
                subtotal: Number(data.subtotal) || Number(data.price) || resolvedTotal,
                taxAmount: Number(data.taxAmount) || 0,
                totalAmount: resolvedTotal,
                total: resolvedTotal,
                orderStatus: normalizedSt,
                status: normalizedSt,
                paymentStatus: data.paymentStatus || 'demo_paid',
                paymentMethod: data.paymentMethod || 'UPI (GPAY)',
                createdAt: data.createdAt || new Date().toISOString(),
                customerNotes: data.customerNotes || undefined,
              });
            }
          });
        }
      } catch {
        // ignore
      }

      const ordersList = Array.from(ordersMap.values());

      // Sort by createdAt descending so newest orders appear on top
      ordersList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      onOrders(ordersList);
    },
    (error) => {
      console.error('[Firestore] subscribeToAllOrders error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Real-time listener for a single order by orderId from the existing orders collection.
 */
export function subscribeToSingleOrder(
  orderId: string,
  onOrder: (order: Order | null) => void
): Unsubscribe {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onOrder(null);
        return;
      }
      const data = snapshot.data();
      const normalizedSt = normalizeOrderStatus(data.orderStatus || data.status);
      const resolvedTotal = Number(data.totalAmount) || Number(data.total) || 0;

      onOrder({
        orderId: data.orderId || snapshot.id,
        customerName: data.customerName || data.customerDetails?.name || undefined,
        phoneNumber: data.phoneNumber || data.customerDetails?.phone || undefined,
        customerDetails: data.customerDetails,
        seatNumber: data.seatNumber || '',
        screenNumber: data.screenNumber || '1',
        theatreName: data.theatreName || 'Namma Cinemas (Express Screen)',
        items: Array.isArray(data.items) ? data.items : [],
        subtotal: Number(data.subtotal) || Number(data.price) || resolvedTotal,
        taxAmount: Number(data.taxAmount) || 0,
        totalAmount: resolvedTotal,
        total: resolvedTotal,
        orderStatus: normalizedSt,
        status: normalizedSt,
        paymentStatus: data.paymentStatus || 'demo_paid',
        paymentMethod: data.paymentMethod || 'UPI (GPAY)',
        createdAt: data.createdAt || new Date().toISOString(),
        customerNotes: data.customerNotes || undefined,
      });
    },
    (error) => {
      console.error('[Firestore] Error listening to single order:', error);
    }
  );
}
