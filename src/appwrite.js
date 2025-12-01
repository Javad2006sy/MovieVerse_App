import { Client, TablesDB, ID, Query } from "appwrite";

// Appwrite DataBase Setup
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const PROJECT_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
	.setEndpoint(PROJECT_ENDPOINT)
	.setProject(PROJECT_ID);

const database = new TablesDB(client);

// function for updating top trending movies
export const updateSearchCount = async (searchTerm, movie) => {
	// 1. use Appwrite SDK to check if the search term exist in the database
	try {
		const result = await database.listRows({
			databaseId: DATABASE_ID,
			tableId: TABLE_ID,
			queries: [Query.equal("searchTerm", searchTerm)],
		});

		// 2. If it does, update the count
		if (result.rows.length > 0) {
			const row = result.rows[0];

			await database.updateRow(DATABASE_ID, TABLE_ID, row.$id, {
				count: row.count + 1,
			});
		} else {
			// 3. If it doesn't, create a new row with the search term and count as 1
			await database.createRow({
				databaseId: DATABASE_ID,
				tableId: TABLE_ID,
				rowId: ID.unique(),
				data: {
					searchTerm: searchTerm,
					count: 1,
					movie_id: movie.id,
					poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
				},
			});
		}
	} catch (error) {
		console.error(error);
	}
};

// function for fetching top trending movies
export const getTrendingMovies = async () => {
	try {
		const result = await database.listRows({
			databaseId: DATABASE_ID,
			tableId: TABLE_ID,
			queries: [Query.limit(5), Query.orderDesc("count")],
		});

		return result.rows;
	} catch (error) {
		console.error(error);
	}
};
