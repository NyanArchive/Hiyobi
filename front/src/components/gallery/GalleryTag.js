import React from "react";
import styled, { css } from "styled-components";
import { NavLink } from "react-router-dom";

const GalleryTag = (props) => {
  let href = props.value;
  if (href) {
    let tagprops = {};

    let splited = href.split(":");
    let prefix = splited[0];

    if (splited.length === 1) {
      href = "tag:" + href;
    }

    //태그 색깔
    if (prefix === "female") {
      tagprops.female = "";
    } else if (prefix === "male") {
      tagprops.male = "";
    }

    return (
      <Tag {...tagprops} target="_blank" href={`/search/${href}`}>
        {props.display ? props.display : props.value}
      </Tag>
    );
  } else {
    return null;
  }
};
/*
GalleryTag.defaultProps = {

}
*/

const Tag = styled.a`
  background: #999;
  color: white;
  padding: 0.1875rem;
  border-radius: 0.3125rem;
  font-size: 12px;
  margin-right: 0.25rem;
  margin-bottom: 0.1875rem;

  &:link,
  &:visited {
    color: white;
    text-decoration: none;
    text-transform: capitalize;
  }

  ${(props) => {
    if (typeof props.female !== "undefined") {
      return css`
        background-color: rgb(255, 94, 94);
      `;
    } else if (typeof props.male !== "undefined") {
      return css`
        background-color: rgb(65, 149, 244);
      `;
    }
  }}
`;

export default GalleryTag;
