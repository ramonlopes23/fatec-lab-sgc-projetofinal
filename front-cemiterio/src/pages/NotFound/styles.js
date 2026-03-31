import styled from "styled-components";

export const Container = styled.div`
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content: center;
    height:100vh;
    background: linear-gradiente(135deg, #667eea 0%, #764ba2 100%);
    color:#191970;
    text-align:center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubutu', sans-serif;
`;

export const Button = styled.button`
    margin-top:20px;
    padding:10px 20px;
    background:white;
    color:#191970;
    border:5;
    border-color:#191970;
    border-radius:8px;
    cursor:pointer;
    font-weight:bold;
    font-size:16px;
    &:hover{
    background:#fff
    }
`;

