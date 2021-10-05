import React from "react";
import styled, { css } from "styled-components";

const Loading = (props) => {
  return (
    <Background isLoading={props.isLoading}>
      <div className="lds-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <span>{props.text}</span>
    </Background>
  );
};

const Background = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  transition: all 0.2s ease-out;
  z-index: 100;

  ${(props) => {
    if (props.isLoading === true) {
      return css`
        opacity: 1;
        visibility: visible;
      `;
    } else {
      return css`
        opacity: 0;
        visibility: hidden;
      `;
    }
  }}

  & > span {
    color: white;
    font-size: 14px;
  }
`;

export default Loading;
