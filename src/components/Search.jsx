function Search({ searchTerm, onChange }) {
	return (
		<div className="search">
			<div>
				<img
					src="/search.svg"
					alt="search"
					className="cursor-pointer"
				/>

				<input
					type="text"
					placeholder="Search through thousands of movies ..."
					value={searchTerm}
					onChange={(e) => onChange(e.target.value)}
				/>
			</div>
		</div>
	);
}

export default Search;
