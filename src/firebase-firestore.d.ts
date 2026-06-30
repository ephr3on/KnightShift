declare module 'firebase/firestore' {
  export type Firestore = { readonly __firestoreBrand?: unique symbol };
  export type DocumentReference = { readonly __docRefBrand?: unique symbol };
  export type CollectionReference = { readonly __collectionRefBrand?: unique symbol };
  export type Unsubscribe = () => void;
  export type FieldValue = unknown;
  export type DocumentSnapshot = { exists: () => boolean; data: () => unknown };
  export type QueryDocumentSnapshot = { data: () => unknown };
  export type QuerySnapshot = { docs: QueryDocumentSnapshot[]; size: number };
  export type Transaction = {
    get: (ref: DocumentReference) => Promise<DocumentSnapshot>;
    update: (ref: DocumentReference, data: Record<string, unknown>) => void;
    set?: (ref: DocumentReference, data: Record<string, unknown>, options?: unknown) => void;
  };
  export function getFirestore(app?: unknown): Firestore;
  export function doc(...args: unknown[]): DocumentReference;
  export function collection(...args: unknown[]): CollectionReference;
  export function getDoc(ref: DocumentReference): Promise<DocumentSnapshot>;
  export function setDoc(ref: DocumentReference, data: unknown, options?: unknown): Promise<void>;
  export function updateDoc(ref: DocumentReference, data: unknown): Promise<void>;
  export function serverTimestamp(): FieldValue;
  export function deleteField(): FieldValue;
  export function runTransaction<T>(db: Firestore, updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
  export function onSnapshot(ref: DocumentReference, next: (snapshot: DocumentSnapshot) => void, error?: (error: unknown) => void): Unsubscribe;
  export function onSnapshot(ref: CollectionReference, next: (snapshot: QuerySnapshot) => void, error?: (error: unknown) => void): Unsubscribe;
  export function onSnapshot(ref: DocumentReference, options: unknown, next: (snapshot: DocumentSnapshot) => void, error?: (error: unknown) => void): Unsubscribe;
  export function onSnapshot(ref: CollectionReference, options: unknown, next: (snapshot: QuerySnapshot) => void, error?: (error: unknown) => void): Unsubscribe;
}
