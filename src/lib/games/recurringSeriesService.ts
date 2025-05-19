import { db } from "@/lib/firebase/firebaseClient";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  updateDoc,
  deleteDoc,
  Timestamp,
  startAfter
} from "firebase/firestore";
import { RecurringSeries, Game, GameStatus } from "@/lib/types/models";
import { createGame, updateGame, deleteGame, getGame } from "./gameService";

/**
 * Create a new recurring series
 * 
 * @param seriesData - The recurring series data to create
 * @param userId - The ID of the user creating the series
 * @returns A promise that resolves to the created recurring series
 */
export async function createRecurringSeries(
  seriesData: Omit<RecurringSeries, 'id' | 'createdBy' | 'createdAt'>, 
  userId: string
): Promise<RecurringSeries> {
  try {
    // Create a new document reference with auto-generated ID
    const seriesRef = doc(collection(db, "recurringSeries"));
    
    // Prepare the series data
    const newSeries: RecurringSeries = {
      id: seriesRef.id,
      ...seriesData,
      createdBy: userId,
      createdAt: serverTimestamp()
    };
    
    // Create the recurring series document
    await setDoc(seriesRef, newSeries);
    
    return {
      ...newSeries,
      createdAt: Timestamp.now() // Replace serverTimestamp with actual Timestamp for return value
    };
  } catch (error) {
    console.error("Error creating recurring series:", error);
    throw new Error("Failed to create recurring series");
  }
}

/**
 * Get a recurring series by ID
 * 
 * @param seriesId - The ID of the recurring series to get
 * @returns A promise that resolves to the recurring series or null if not found
 */
export async function getRecurringSeries(seriesId: string): Promise<RecurringSeries | null> {
  try {
    const seriesDoc = await getDoc(doc(db, "recurringSeries", seriesId));
    
    if (!seriesDoc.exists()) {
      return null;
    }
    
    return seriesDoc.data() as RecurringSeries;
  } catch (error) {
    console.error("Error getting recurring series:", error);
    throw new Error("Failed to get recurring series");
  }
}

/**
 * Update a recurring series
 * 
 * @param seriesId - The ID of the recurring series to update
 * @param seriesData - The recurring series data to update
 * @returns A promise that resolves when the recurring series is updated
 */
export async function updateRecurringSeries(
  seriesId: string, 
  seriesData: Partial<Omit<RecurringSeries, 'id' | 'createdBy' | 'createdAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, "recurringSeries", seriesId), seriesData);
  } catch (error) {
    console.error("Error updating recurring series:", error);
    throw new Error("Failed to update recurring series");
  }
}

/**
 * Delete a recurring series
 * 
 * @param seriesId - The ID of the recurring series to delete
 * @param deleteAllInstances - Whether to delete all future game instances
 * @returns A promise that resolves when the recurring series is deleted
 */
export async function deleteRecurringSeries(
  seriesId: string,
  deleteAllInstances: boolean = false
): Promise<void> {
  try {
    // Delete the recurring series document
    await deleteDoc(doc(db, "recurringSeries", seriesId));
    
    // If deleteAllInstances is true, delete all future game instances
    if (deleteAllInstances) {
      const now = new Date();
      
      // Get all future game instances for this series
      const gamesQuery = query(
        collection(db, "games"),
        where("recurringSeriesId", "==", seriesId),
        where("date", ">=", now),
        orderBy("date", "asc")
      );
      
      const gameDocs = await getDocs(gamesQuery);
      
      // Delete each game instance
      const deletePromises = gameDocs.docs.map(gameDoc => 
        deleteGame(gameDoc.id)
      );
      
      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error("Error deleting recurring series:", error);
    throw new Error("Failed to delete recurring series");
  }
}

/**
 * Get recurring series for a group
 * 
 * @param groupId - The ID of the group to get recurring series for
 * @param maxResults - Maximum number of results to return
 * @returns A promise that resolves to an array of recurring series
 */
export async function getGroupRecurringSeries(
  groupId: string,
  maxResults: number = 20
): Promise<RecurringSeries[]> {
  try {
    const seriesQuery = query(
      collection(db, "recurringSeries"),
      where("groupId", "==", groupId),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );
    
    const seriesDocs = await getDocs(seriesQuery);
    
    return seriesDocs.docs.map(doc => doc.data() as RecurringSeries);
  } catch (error) {
    console.error("Error getting group recurring series:", error);
    throw new Error("Failed to get group recurring series");
  }
}

/**
 * Get game instances for a recurring series
 * 
 * @param seriesId - The ID of the recurring series to get game instances for
 * @param includeCompleted - Whether to include completed games
 * @param maxResults - Maximum number of results to return
 * @returns A promise that resolves to an array of games
 */
export async function getSeriesInstances(
  seriesId: string,
  includeCompleted: boolean = false,
  maxResults: number = 20
): Promise<Game[]> {
  try {
    let gamesQuery;
    
    if (includeCompleted) {
      gamesQuery = query(
        collection(db, "games"),
        where("recurringSeriesId", "==", seriesId),
        orderBy("date", "asc"),
        limit(maxResults)
      );
    } else {
      const now = new Date();
      
      gamesQuery = query(
        collection(db, "games"),
        where("recurringSeriesId", "==", seriesId),
        where("date", ">=", now),
        orderBy("date", "asc"),
        limit(maxResults)
      );
    }
    
    const gameDocs = await getDocs(gamesQuery);
    
    return gameDocs.docs.map(doc => doc.data() as Game);
  } catch (error) {
    console.error("Error getting series instances:", error);
    throw new Error("Failed to get series instances");
  }
}

/**
 * Generate game instances for a recurring series
 * 
 * @param seriesId - The ID of the recurring series to generate instances for
 * @param templateGame - The template game to use for generating instances
 * @param startDate - The start date for generating instances
 * @param endDate - The end date for generating instances
 * @param userId - The ID of the user generating the instances
 * @returns A promise that resolves to an array of created games
 */
export async function generateSeriesInstances(
  seriesId: string,
  templateGame: Omit<Game, 'id' | 'createdBy' | 'createdAt' | 'currentParticipants' | 'date'>,
  startDate: Date,
  endDate: Date,
  userId: string
): Promise<Game[]> {
  try {
    // Get the recurring series
    const series = await getRecurringSeries(seriesId);
    
    if (!series) {
      throw new Error("Recurring series not found");
    }
    
    // Calculate the dates for the instances
    const dates = calculateRecurringDates(
      series.frequency,
      series.dayOfWeek,
      startDate,
      endDate
    );
    
    // Create a game instance for each date
    const createdGames: Game[] = [];
    
    for (const date of dates) {
      // Create the game
      const newGame = await createGame({
        ...templateGame,
        date,
        isRecurring: true,
        recurringSeriesId: seriesId,
        status: GameStatus.UPCOMING
      }, userId);
      
      createdGames.push(newGame);
    }
    
    return createdGames;
  } catch (error) {
    console.error("Error generating series instances:", error);
    throw new Error("Failed to generate series instances");
  }
}

/**
 * Update future instances of a recurring series
 * 
 * @param seriesId - The ID of the recurring series to update instances for
 * @param updateData - The data to update on each instance
 * @param startDate - The start date for updating instances (defaults to now)
 * @returns A promise that resolves when the instances are updated
 */
export async function updateFutureSeriesInstances(
  seriesId: string,
  updateData: Partial<Omit<Game, 'id' | 'createdBy' | 'createdAt' | 'currentParticipants' | 'date' | 'recurringSeriesId' | 'isRecurring'>>,
  startDate: Date = new Date()
): Promise<void> {
  try {
    // Get all future game instances for this series
    const gamesQuery = query(
      collection(db, "games"),
      where("recurringSeriesId", "==", seriesId),
      where("date", ">=", startDate),
      orderBy("date", "asc")
    );
    
    const gameDocs = await getDocs(gamesQuery);
    
    // Update each game instance
    const updatePromises = gameDocs.docs.map(gameDoc => 
      updateGame(gameDoc.id, updateData)
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating future series instances:", error);
    throw new Error("Failed to update future series instances");
  }
}

/**
 * Calculate recurring dates based on frequency
 * 
 * @param frequency - The frequency of recurrence
 * @param dayOfWeek - The day of week (0-6, where 0 is Sunday)
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns An array of dates
 */
function calculateRecurringDates(
  frequency: 'weekly' | 'biweekly' | 'monthly',
  dayOfWeek: number | undefined,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  // If dayOfWeek is specified, adjust the start date to the next occurrence of that day
  if (dayOfWeek !== undefined) {
    const currentDayOfWeek = currentDate.getDay();
    const daysToAdd = (dayOfWeek - currentDayOfWeek + 7) % 7;
    
    if (daysToAdd > 0) {
      currentDate.setDate(currentDate.getDate() + daysToAdd);
    }
  }
  
  // Generate dates based on frequency
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    switch (frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }
  
  return dates;
}
