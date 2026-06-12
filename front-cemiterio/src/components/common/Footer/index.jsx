import React from "react";

import {FooterWrapper, FooterContainer, SubFooter} from "./styles";



export default function Footer(){
    return(
        <FooterWrapper>
            <FooterContainer>
            <li>
                <a to="#">Sobre</a>
            </li>
            <li>
                <a to="#">Termos</a>
            </li>
            </FooterContainer>

            <SubFooter>© 2025, todos os direitos reservados</SubFooter>
        </FooterWrapper>
    )
}