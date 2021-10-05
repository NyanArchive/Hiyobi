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
} from "reactstrap";
import { NavLink as RRNavLink } from "react-router-dom";
import Login from "../modal/Login";
import ModalPortal from "../modal/ModalPortal";

const MainNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="dark" dark expand="lg">
      <NavbarBrand tag={RRNavLink} to="/">
        Hiyobi.me
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto" navbar>
          <NavItem>
            <NavLink>
              <span className="oi oi-resize-height" /> 세로맞춤
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <span className="oi oi-resize-width" /> 가로맞춤
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <span className="oi oi-browser" /> 전체화면
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <span className="oi oi-media-stop" /> 한장보기
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <span className="oi oi-media-pause" /> 펼쳐보기
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <span className="oi oi-loop" /> 페이지
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <span className="oi oi-loop" /> 스크롤
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <span className="oi oi-info" /> 갤러리 정보
            </NavLink>
          </NavItem>
        </Nav>
        <Nav className="ml-auto" navbar></Nav>
      </Collapse>
    </Navbar>
  );
};

export default MainNavbar;
