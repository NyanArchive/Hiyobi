import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "reactstrap";
import {
  Login as userLogin,
  Register,
  resendVerificationMail,
} from "../../lib/User";

const Login = ({ isOpen, onChange }) => {
  const [modal, setModal] = useState(isOpen);
  const [mode, setMode] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [remember, setRemember] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const toggle = () => {
    onChange(!modal);
    setModal(!modal);
  };
  const toggleMode = () => {
    setPassword("");
    setPasswordDup("");
    setMode(!mode);
  };
  const emailInput = (e) => setEmail(e.target.value);
  const nameInput = (e) => setName(e.target.value);
  const passwordInput = (e) => setPassword(e.target.value);
  const passwordDupInput = (e) => setPasswordDup(e.target.value);
  const rememberToggle = (e) => setRemember(!remember);

  useEffect(() => {
    setModal(isOpen);
  }, [isOpen]);

  const onSubmit = async (e) => {
    try {
      setLoading(true);
      let result = await userLogin({
        email: email,
        password: password,
        isRemember: remember,
      });

      //로그인 성공
      if (result.result === "ok") {
        window.location.reload();
      } else {
        alert("에러발생 : " + result.errorMsg);
      }
      setLoading(false);
    } catch (e) {
      alert(e);
    }
  };

  const onRegister = async () => {
    if (email === "" || password === "" || name === "") {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (password !== passwordDup) {
      alert("비밀번호 중복확인이 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      let result = await Register({
        email: email,
        name: name,
        password: password,
      });

      if (result.result === "ok") {
        alert("회원가입 완료\n이메일 인증 완료 후 로그인 가능합니다.");
        setEmail("");
        setPassword("");
        toggleMode();
      } else {
        alert("에러발생 : " + result.errorMsg);
      }
      setLoading(false);
    } catch (e) {
      alert(e);
      setLoading(false);
    }
  };

  const onKeyPress = (e) => {
    if (e.keyCode === 13) {
      onSubmit();
    }
  };

  const onResendMail = async () => {
    let email = window.prompt(
      "가입하신 이메일을 적어주세요.\n이미 인증되어있는 계정의 경우에는 발송되지 않습니다."
    );
    if (email === "") {
      alert("이메일을 입력해주세요");
      return;
    }
    let result = await resendVerificationMail(email);
    if (result.result === "ok") {
      alert("발송완료");
    } else {
      alert("에러발생");
    }
  };

  if (mode === true) {
    return (
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>로그인</ModalHeader>
        <ModalBody>
          <form onSubmit={onSubmit}>
            이메일 :{" "}
            <Input
              type="email"
              onKeyDown={onKeyPress}
              value={email}
              onChange={emailInput}
            />
            비밀번호 :{" "}
            <Input
              type="password"
              onKeyDown={onKeyPress}
              value={password}
              onChange={passwordInput}
            />
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={rememberToggle}
              />{" "}
              자동 로그인
            </label>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={isLoading} onClick={onSubmit}>
            {isLoading ? "..." : "로그인"}
          </Button>{" "}
          <Button color="secondary" onClick={toggleMode}>
            회원가입
          </Button>
        </ModalFooter>
      </Modal>
    );
  } else {
    return (
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>회원가입</ModalHeader>
        <ModalBody>
          이메일 :{" "}
          <Input
            type="email"
            onKeyDown={onKeyPress}
            value={email}
            onChange={emailInput}
          />
          닉네임 :{" "}
          <Input
            type="text"
            onKeyDown={onKeyPress}
            value={name}
            onChange={nameInput}
          />
          비밀번호 :{" "}
          <Input
            type="password"
            onKeyDown={onKeyPress}
            value={password}
            onChange={passwordInput}
          />
          비밀번호 확인 :{" "}
          <Input
            type="password"
            onKeyDown={onKeyPress}
            value={passwordDup}
            onChange={passwordDupInput}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="link" disabled={isLoading} onClick={onResendMail}>
            인증메일 재발송
          </Button>
          <Button color="primary" disabled={isLoading} onClick={onRegister}>
            {isLoading ? "..." : "회원가입"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
};

export default Login;
