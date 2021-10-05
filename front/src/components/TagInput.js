import React, { useEffect, useState } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/dist/tagify.css";

const TagInput = ({ autoComplete, onChange, value, placeholder, settings }) => {
  let defaultTag = [];
  if (typeof value !== "undefined") {
    defaultTag = value;
  }
  if (typeof placeholder === "undefined") {
    placeholder = "검색";
  }

  const transformTag = (tag) => {
    if (tag.value.startsWith("female:") || tag.value.startsWith("여:")) {
      tag.style = "--tag-bg: rgb(255, 94, 94);";
    } else if (tag.value.startsWith("male:") || tag.value.startsWith("남:")) {
      tag.style = "--tag-bg: rgb(65, 149, 244);";
    }
  };

  const onAddTag = (e) => {
    let tmp = e.detail.tagify.value.map((val) => {
      return val.value;
    });
    onChange(tmp);
  };

  const onRemoveTag = (e) => {
    let tmp = e.detail.tagify.value.map((val) => {
      return val.value;
    });
    onChange(tmp);
  };

  return (
    <Tags
      settings={{
        whitelist: autoComplete,
        placeholder: placeholder,
        transformTag: transformTag,
        delimiters: "\n",
        callbacks: {
          add: onAddTag,
          remove: onRemoveTag,
        },
        dropdown: {
          enabled: 1,
        },
        ...settings,
      }}
      defaultValue={value}
      style={{ width: "100%" }}
    />
  );
};

export default TagInput;
