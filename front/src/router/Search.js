import React from "react";
import SearchBar from "../components/SearchBar";
import Navbar from "../components/navbar/Navbar";
import { Container } from "reactstrap";

const Search = () => {
  document.title = "검색 - hiyobi.me";
  return (
    <>
      <Navbar />
      <Container>
        <SearchBar />
      </Container>
    </>
  );
};

export default Search;
