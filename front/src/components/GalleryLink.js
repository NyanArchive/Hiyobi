import React, { useState, useEffect, useCallback } from "react";
import GalleryBlock from "./gallery/GalleryBlock";
import { GalleryInfo } from "../lib/Gallery";

const GalleryLink = (props) => {
  const { id, children } = props;

  const [isDisplay, setDisplay] = useState(false);
  const [data, setData] = useState();

  const onClickLink = (e) => {
    e.preventDefault();
    setDisplay(true);
  };

  const onClickEvent = useCallback(
    (e) => {
      if (isDisplay && typeof data !== "undefined") {
        let el = document.getElementById(data.id);
        let rect = el.getBoundingClientRect();

        if (
          rect.left > e.clientX ||
          rect.right < e.clientX ||
          rect.top > e.clientY ||
          rect.bottom < e.clientY
        ) {
          setDisplay(false);
        }
      }
    },
    [data, isDisplay]
  );

  useEffect(() => {
    async function getGalleryInfo() {
      let info = await GalleryInfo(id);

      setData(info);
    }
    if (isDisplay === true && typeof data === "undefined") {
      getGalleryInfo();
    }
    window.addEventListener("click", onClickEvent, { passive: true });

    return () => window.removeEventListener("click", onClickEvent);
  }, [data, id, isDisplay, onClickEvent]);

  return (
    <>
      {isDisplay && (
        <div
          style={{
            position: "relative",
          }}
        >
          <GalleryBlock
            style={{ position: "absolute", bottom: 0 }}
            data={data}
            id={data && data.id}
          />
        </div>
      )}
      <a href={children} onClick={onClickLink}>
        {children}
      </a>
    </>
  );
};

export default GalleryLink;
