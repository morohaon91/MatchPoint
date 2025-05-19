import {
  Timestamp,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
} from "firebase/firestore";

// Firestore Data Converter
export const firestoreConverter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore(data: T): DocumentData {
    const firestoreData: DocumentData = {};
    const dataAsAny = data as any; // Use any for iterating over potentially unknown keys
    for (const key in data) {
      // Ensure we are iterating over own properties and skip 'id' if it exists at the top level
      // The 'id' field is typically managed by Firestore as the document ID and not stored in the document data itself.
      if (Object.prototype.hasOwnProperty.call(data, key) && key !== "id") {
        const value = dataAsAny[key];
        if (value instanceof Date) {
          firestoreData[key] = Timestamp.fromDate(value);
        } else if (value !== undefined) {
          // Do not write undefined values to Firestore
          firestoreData[key] = value;
        }
      }
    }
    return firestoreData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
    const data = snapshot.data(options);
    // Convert Firestore Timestamps to JS Date objects
    const convertTimestamps = (obj: any): any => {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (obj instanceof Timestamp) {
        return obj.toDate();
      }
      if (Array.isArray(obj)) {
        return obj.map(convertTimestamps);
      }
      const newObj: { [key: string]: any } = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = convertTimestamps(obj[key]);
        }
      }
      return newObj;
    };
    return {
      id: snapshot.id, // Automatically add the document ID to the object
      ...convertTimestamps(data),
    } as T;
  },
});
