import JSZip from "jszip";
import React, { useEffect, useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, Progress, Button } from "reactstrap";
import styled, { css } from "styled-components";
import { CDNURL } from "../../lib/Constants";
import { blobfetch } from "../../lib/Fetch";
import { saveAs } from "file-saver";
import { GetGalleryListJson } from "../../lib/Gallery";

let zip;

const GalleryDownloader = (props) => {
  const { info, onClickClose } = props;

  const [listLength, setListLength] = useState(0);
  const [isDownloading, setDownloading] = useState(true);
  const [progress, setProgress] = useState(-1);

  const initDownload = useCallback(async () => {
    try {
      if (
        !window.confirm(
          "다운로드 하시겠습니까?\n브라우저의 한계로 파일이 클 경우 정상적으로 다운로드 되지 않을 수 있습니다."
        )
      ) {
        onClickClose();
        return;
      }
      setDownloading(true);

      let list = props.list;

      if (typeof list === "undefined") {
        list = await GetGalleryListJson(info.id);
      }
      setListLength(list.length);

      setProgress(0);
      zip = new JSZip();

      for (let i in list) {
        let file = await blobfetch({
          url: `${CDNURL}/data/${info.id}/${list[i].name}`,
          method: "GET",
        });
        zip.file(list[i].name, file);
        setProgress(Number(i) + 1);
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(
          content,
          "hiyobi - " + info.title + "(" + info.id + ")" + ".zip"
        );
        setDownloading(false);
      });
    } catch (e) {
      alert("다운로드 중 에러가 발생했습니다. 다시 시도해보세요.");
      onClickClose();
      return;
    }
  }, [info.id, info.title, onClickClose, props.list]);

  useEffect(() => {
    initDownload();
  }, [initDownload]);

  return (
    <Modal isOpen={true} backdrop={"static"} keyboard={false}>
      <ModalHeader>다운로드중...</ModalHeader>
      <ModalBody>
        {isDownloading && (
          <Progress
            animated={progress < 0}
            value={progress < 0 ? 100 : (progress / listLength) * 100}
          >
            {progress > 0 && `${progress}/${listLength}`}
          </Progress>
        )}
        {!isDownloading && (
          <>
            다운로드 완료
            <br />
            <Button onClick={() => onClickClose()}>닫기</Button>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default GalleryDownloader;
