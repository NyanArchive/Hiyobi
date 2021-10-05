import React, { useCallback, useEffect, useState } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import { getAutoComplete } from "../lib/AutoComplete";

const SearchAutoComplete = ({ onChange, value, placeholder }) => {
  let defaultTag = [];
  if (typeof value !== "undefined") {
    defaultTag = value;
  }
  if (typeof placeholder === "undefined") {
    placeholder = "검색";
  }

  const [tags, setTags] = useState(defaultTag);
  const [isLoading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState([]);

  const getAuto = useCallback(async () => {
    setLoading(true);
    let auto = await getAutoComplete();
    setSuggestion(auto);
    setLoading(false);
  }, []);

  useEffect(() => {
    getAuto();
  }, [getAuto]);

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
    setTags(tmp);
    onChange(tmp);
  };

  const onRemoveTag = (e) => {
    let tmp = e.detail.tagify.value.map((val) => {
      return val.value;
    });
    setTags(tmp);
    onChange(tmp);
  };

  return (
    <Tags
      settings={{
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
        loading: true,
      }}
      whitelist={suggestion}
      value={value}
      style={{ width: "100%" }}
      loading={isLoading}
    />
  );
};

export default SearchAutoComplete;
