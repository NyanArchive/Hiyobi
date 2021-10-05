import React, { useState, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from "reactstrap";
import { NavLink as RRNavLink } from "react-router-dom";
import Login from "../modal/Login";
import ModalPortal from "../modal/ModalPortal";
import { isLogined, getUserName, Logout } from "../../lib/User";
import Cookie from "js-cookie";
import NoticeBar from "./NoticeBar";
import UserNotification from "./UserNotification";

const MainNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const toggleLogin = () => setLoginOpen(!isLoginOpen);
  let blblur = Cookie.get("blblur");

  const executeLogout = async () => {
    let result = await Logout();
    if (result === true) {
      alert("로그아웃 되었습니다.");
      window.location.reload();
    } else {
      alert("에러발생");
    }
  };

  const ToggleBlBlur = () => {
    let blblur = Cookie.get("blblur");

    if (blblur === "true") {
      Cookie.set("blblur", false, { expires: 365 });
      window.location.reload();
    } else {
      Cookie.set("blblur", true, { expires: 365 });
      window.location.reload();
    }
  };

  useEffect(() => {
    setLoginOpen(isLoginOpen);
  }, [isLoginOpen]);

  return (
    <>
      <Navbar
        light
        className="navbar-expand"
        style={{ backgroundColor: "#e3f2fd" }}
      >
        <NavbarBrand tag={RRNavLink} to="/">
          hiyobi.me
        </NavbarBrand>
        <Nav className="mr-auto" navbar>
          <NavItem>
            <NavLink tag={RRNavLink} to="/board">
              <span className="oi oi-comment-square" />{" "}
              <span className="d-none d-md-inline">게시판</span>
            </NavLink>
          </NavItem>
        </Nav>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink tag={RRNavLink} to="/search">
                <span className="oi oi-magnifying-glass" />{" "}
                <span className="d-none d-md-inline">검색</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RRNavLink} to="/random">
                <span className="oi oi-random" />{" "}
                <span className="d-none d-md-inline">랜덤</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={RRNavLink} to="/upload">
                <span className="oi oi-cloud-upload" />{" "}
                <span className="d-none d-md-inline">업로드</span>
              </NavLink>
            </NavItem>
          </Nav>
          <Nav className="ml-auto" navbar>
            {isLogined() && <UserNotification />}
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                <span className="oi oi-person" />
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem header>
                  {isLogined() ? getUserName() : "로그인되지 않았습니다."}
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem tag={RRNavLink} to="/bookmark">
                  북마크
                </DropdownItem>
                <DropdownItem onClick={ToggleBlBlur}>
                  BL검열 <b>{blblur === "true" ? "ON" : "OFF"}</b>
                </DropdownItem>
                <DropdownItem tag={RRNavLink} to="/setting">
                  설정
                </DropdownItem>
                <DropdownItem divider />
                {isLogined() ? (
                  <DropdownItem onClick={executeLogout}>로그아웃</DropdownItem>
                ) : (
                  <DropdownItem onClick={toggleLogin}>로그인</DropdownItem>
                )}
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
        <ModalPortal>
          <Login
            isOpen={isLoginOpen}
            onChange={(e) => {
              setLoginOpen(e);
            }}
          />
        </ModalPortal>
      </Navbar>
      <NoticeBar />
    </>
  );
};

export default MainNavbar;
