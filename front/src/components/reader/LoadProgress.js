import React from "react";
import styled from "styled-components";

const LoadProgress = (props) => {
  let progress = (props.current / props.total) * 100;
  if (props.loading === true) {
    return (
      <div>
        <LoaderProgress progress={progress}>
          {props.current} / {props.total}
        </LoaderProgress>
        <LoadImg style={{ backgroundImage: "url('/load.gif')" }} />
      </div>
    );
  } else {
    return null;
  }
};

const LoaderProgress = styled.div`
  background: #2299dd;
  position: fixed;
  z-index: 2000;
  top: 0;
  right: 100%;
  width: 100%;
  height: 5px;
  text-align: right;
  color: white;

  transform: translate3d(${(props) => props.progress}%, 0px, 0px);
`;

const LoadImg = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  width: 32px;
  height: 32px;
  z-index: 100;
`;
export default LoadProgress;
