import React from 'react'
import { Btn, CardIcon, Container, Card, CardBody, CardHeader, DashboardWrapper, ProcessAction, ProcessItem, ProcessInfo, CardAction, CardText, CardTitle, CardsGrid, ProcessCard, Subtitle, Title } from './styles.js'
import { useNavigate } from 'react-router-dom';
import { LiaFileContractSolid } from "react-icons/lia";
import { GiArchiveResearch } from "react-icons/gi";
import { TbReportAnalytics } from "react-icons/tb";
import { FaMoneyBill1Wave } from 'react-icons/fa6';


const OPTIONS = [
    {
        id: "taxas",
        title: "Taxas",
        desc: "Gerenciamento de taxas dos cemitério.",
        route: "/taxas",
        icon: FaMoneyBill1Wave,
    },
    {
        id: "contratos",
        title: "Contratos",
        desc: "Gerenciamento de contratos e títulos de posse.",
        route: "/contratos",
        icon: LiaFileContractSolid,
    },
    {
        id: "relatorios",
        title: "Relatórios",
        desc: "Visualização de dados operacionais do cemitério, sepultamentos, exumações e taxas.",
        route: "/relatorios",
        icon: TbReportAnalytics,
    },
    {
        id: "registros",
        title: "Registros",
        desc: "Gerenciamento e consulta de dados dos falecidos.",
        route: "/registros",
        icon: GiArchiveResearch,
    }
]

export default function ProcessSelection() {
    const navigate = useNavigate();
    return (
        <>
            <Container>
                <DashboardWrapper>
                    <Card>
                        <CardHeader>Seleção de Processos </CardHeader>
                        <CardBody>
                            <ProcessInfo>
                                Selecione o tipo de processo que deseja visualizar:
                            </ProcessInfo>
                        </CardBody>
                    </Card>
                </DashboardWrapper>
                <CardsGrid>
                    {OPTIONS.map((item) => {
                        const Icon = item.icon;

                        return (
                            <ProcessCard key={item.id}>
                                <CardIcon>
                                    <Icon />
                                </CardIcon>
                                <CardTitle>{item.title}</CardTitle>
                                <CardText>{item.desc}</CardText>
                                <CardAction type="button" onClick={() => navigate(item.route)}>SELECIONAR</CardAction>
                            </ProcessCard>
                        )
                    })}
                </CardsGrid>
            </Container>
        </>
    )
}
