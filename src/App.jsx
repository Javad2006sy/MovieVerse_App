import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import ReactLenis from "lenis/react";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

// Component imports
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";

// TMDB API Configuration
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_BASE_URL = "https://api.themoviedb.org/3";

const API_OPTIONS = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization: `Bearer ${API_KEY}`,
	},
};

// App Component
function App() {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [errorMessage, setErrorMessage] = useState(null);
	const [movieList, setMovieList] = useState([]);
	const [trendingMovies, setTrendingMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// debounce API calls while searching
	useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

	const fetchMovies = async (query = "") => {
		setIsLoading(true);
		setErrorMessage(null);

		try {
			const endpoint = query
				? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
						query
				  )}`
				: `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

			const response = await fetch(endpoint, API_OPTIONS);

			if (!response.ok) {
				throw new Error("Failed to fetch movies!");
			}

			const data = await response.json();

			if (data.Response === "False") {
				setErrorMessage(data.Error || "Failed to fetch movies!");
				setMovieList([]);
				return;
			}

			// Update movie list
			setMovieList(data.results || []);

			// Update database count
			if (query && data.results.length > 0) {
				await updateSearchCount(query, data.results[0]);
			}
		} catch (error) {
			console.error(`Error fetching movies: ${error}`);
			setErrorMessage("Error fetching movies. Please try again later!");
		} finally {
			setIsLoading(false);
		}
	};

	const loadTrendingMovies = async () => {
		try {
			const movies = await getTrendingMovies();

			setTrendingMovies(movies);
		} catch (error) {
			console.error(`Error fetching trending movies: ${error}`);
		}
	};

	// fetching all movies
	useEffect(() => {
		fetchMovies(debouncedSearchTerm);
	}, [debouncedSearchTerm]);

	// fetching trending movies
	useEffect(() => {
		loadTrendingMovies();
	}, []);

	return (
		<main>
			<ReactLenis root />
			<div className="pattern"></div>

			<div className="wrapper">
				<header>
					<img src="/hero.png" alt="Hero Banner" />
					<h1>
						Find <span className="text-gradient">Movies</span>
						You'll Enjoy Without the Hassle
					</h1>

					<Search searchTerm={searchTerm} onChange={setSearchTerm} />
				</header>

				{trendingMovies.length > 0 && (
					<section className="trending">
						<h2>Trending Movies</h2>

						<ul>
							{trendingMovies.map((movie, index) => (
								<li key={movie.$id}>
									<p>{index + 1}</p>
									<img
										src={movie.poster_url}
										alt={movie.title}
									/>
								</li>
							))}
						</ul>
					</section>
				)}

				<section className="all-movies">
					<h2>All Movies</h2>

					{isLoading ? (
						<Spinner />
					) : errorMessage ? (
						<p className="text-red-500">{errorMessage}</p>
					) : (
						<ul>
							{movieList.map((movie) => (
								<MovieCard key={movie.id} movie={movie} />
							))}
						</ul>
					)}
				</section>
			</div>
		</main>
	);
}

export default App;
