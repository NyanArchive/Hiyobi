import React, { useEffect, Suspense, lazy } from "react";
import "./App.css";
import "./spinner.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Cookie from "js-cookie";
import { unSetUserInfo, getUserInfo } from "./lib/User";
import Analytics from "react-router-ga";

const Main = lazy(() => import("./router/Main"));
const GalleryInfo = lazy(() => import("./router/GalleryInfo"));
const Board = lazy(() => import("./router/Board"));
const BoardView = lazy(() => import("./router/BoardView"));
const BoardWrite = lazy(() => import("./router/BoardWrite"));
const Reader = lazy(() => import("./router/Reader"));
const Bookmark = lazy(() => import("./router/Bookmark"));
const Search = lazy(() => import("./router/Search"));
const Setting = lazy(() => import("./router/Setting"));
const RandomPage = lazy(() => import("./router/RandomPage"));
const Verification = lazy(() => import("./router/Verification"));
const Upload = lazy(() => import("./router/Upload"));
const MyPage = lazy(() => import("./router/MyPage"));

function App() {
  useEffect(() => {
    async function checkToken() {
      let token = Cookie.get("token");
      if (typeof token === "undefined") {
        unSetUserInfo();
      } else {
        let result = await getUserInfo();
        if (result === false) {
          unSetUserInfo();
        }
      }
    }

    async function checkSettings() {
      let blblur = Cookie.get("blblur");
      if (typeof blblur === "undefined") {
        Cookie.set("blblur", true, { expires: 365 });
      }
    }

    checkToken();
    checkSettings();
  }, []);
  return (
    <Router>
      <ScrollToTop />
      <Analytics id="UA-112153847-1">
        <Suspense fallback={<div></div>}>
          <Switch>
            <Route exact path="/" component={Main} />
            <Route exact path="/random" component={RandomPage} />
            <Route exact path="/list" component={Main} />
            <Route exact path="/list/:paging" component={Main} />
            <Route exact path="/info/:gallid" component={GalleryInfo} />
            <Route exact path="/search" component={Search} />
            <Route exact path="/search/:searchstr" component={Main} />
            <Route exact path="/search/:searchstr/:paging" component={Main} />

            <Route exact path="/upload" component={Upload} />

            <Route exact path="/mypage" component={MyPage} />

            <Route exact path="/board/" component={Board} />
            <Route exact path="/board/write" component={BoardWrite} />
            <Route exact path="/board/list/:paging" component={Board} />
            <Route exact path="/board/:viewid" component={BoardView} />

            <Route exact path="/reader/:readid" component={Reader} />
            <Route exact path="/bookmark" component={Bookmark} />
            <Route exact path="/bookmark/:page" component={Bookmark} />

            <Route exact path="/setting" component={Setting} />

            <Route exact path="/verification/:code" component={Verification} />
          </Switch>
        </Suspense>
      </Analytics>
    </Router>
  );
}

export default App;
