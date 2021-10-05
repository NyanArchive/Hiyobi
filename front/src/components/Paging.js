import React from "react";
import { Pagination, PaginationItem, PaginationLink, Input } from "reactstrap";
import { NavLink, useHistory } from "react-router-dom";

const Paging = (props) => {
  let search = props.search;
  let history = useHistory();

  if (typeof props.count === "undefined" || typeof props.page === "undefined") {
    return null;
  }
  if (typeof search === "undefined") {
    search = "";
  }

  let { count, page, pagingRow, contentCount } = props;

  if (page <= 0) {
    page = 1;
  }
  if (count <= 0) {
    count = 0;
  }

  let isFirst = null;
  let isLast = null;

  let div = Math.floor((page - 1) / pagingRow);
  if (div <= 0) {
    isFirst = true;
  }

  if (page > count / contentCount - ((count / contentCount) % pagingRow)) {
    isLast = true;
  }

  let pagearray = [];
  let firstitem = div * pagingRow + 1;
  let lastitem = div * pagingRow + pagingRow;

  if (isLast === true) {
    lastitem = Math.ceil(count / contentCount);
  }

  if (lastitem === 0) {
    return null;
  }

  for (let i = firstitem; i <= lastitem; i++) {
    pagearray.push(
      <PaginationItem key={i} active={i === page}>
        <PaginationLink tag={NavLink} to={`${props.url}/${i}${search}`}>
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  let selector = [];
  if (props.showSelector) {
    for (let i = 1; i <= count / contentCount + 1; i++) {
      selector.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
  }

  return (
    <>
      <Pagination
        size="sm"
        className="table-responsive"
        aria-label="Page navigation"
      >
        <PaginationItem disabled={isFirst}>
          <PaginationLink
            tag={NavLink}
            first
            to={`${props.url}/${firstitem - 1}${search}`}
          />
        </PaginationItem>
        {pagearray}
        <PaginationItem disabled={isLast}>
          <PaginationLink
            tag={NavLink}
            last
            to={`${props.url}/${lastitem + 1}${search}`}
          />
        </PaginationItem>
      </Pagination>
      {props.showSelector && (
        <Input
          type="select"
          onChange={(e) => history.push(`${props.url}/${e.target.value}`)}
        >
          {selector}
        </Input>
      )}
    </>
  );
};

export default Paging;
