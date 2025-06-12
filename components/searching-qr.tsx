"use client"

import { useState } from "react";

const SearchingQR = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    // Implement search functionality here
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchingQR;
