import React, { useState, useEffect } from "react";
import "./App.css";

const SearchBox = ({ onChange }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Search a book title here"
        onChange={onChange}
      />
    </div>
  );
};

const Book = ({ cover, title, authors, publishedIn, isbn }) => {
  return (
    <div className="book">
      {cover ? <img className="book-cover" src={cover} alt="cover" /> : null}
      <div>{title}</div>
      <div>{`By ${authors}`}</div>
      <div>{`Published in: ${publishedIn}`}</div>
      <div>{`ISBN ${isbn}`}</div>
    </div>
  );
};

const BookGrid = ({ books }) => {
  return (
    <div className="book-grid">
      {books.map((book, index) => (
        <Book key={index} {...book} />
      ))}
    </div>
  );
};

export default () => {
  const initialSearchText = "";
  const apiUrl = "http://openlibrary.org/search.json?title=";
  const [books, setBooks] = useState([]);
  const [searchText, setSearchText] = useState(initialSearchText);
  const [timeoutHandler, setTimeoutHandler] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookData = data => {
    return data.docs
      .filter(responseBook => responseBook.author_name && responseBook.isbn)
      .map(responseBook => ({
        cover: `http://covers.openlibrary.org/b/isbn/${
          responseBook.isbn[0]
        }-S.jpg`,
        title: responseBook.title,
        authors: responseBook.author_name.join("; "),
        publishedIn: Array.isArray(responseBook.publish_date)
          ? responseBook.publish_date[0]
          : responseBook.publish_date,
        isbn: responseBook.isbn[0]
      }));
  };

  const fetchBooks = async () => {
    if (searchText) {
      setIsLoading(true);
      const query = encodeURIComponent(searchText);
      const response = await fetch(`${apiUrl}${query}`);
      const data = await response.json();
      const processedData = handleBookData(data);
      setBooks(processedData);
      setIsLoading(false);
    }
  };

  const debounceFetchBooks = () => {
    if (timeoutHandler) {
      clearTimeout(timeoutHandler);
    }
    setTimeoutHandler(setTimeout(fetchBooks, 1000));
  };

  useEffect(
    () => {
      debounceFetchBooks();
    },
    [searchText]
  );

  return (
    <div>
      <SearchBox onChange={e => setSearchText(e.target.value)} />
      {isLoading ? <div>loading...</div> : <BookGrid books={books} />}
    </div>
  );
};
