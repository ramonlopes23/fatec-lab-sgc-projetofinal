import React from 'react'
import { Btn, CardIcon, Container, Card, CardBody, CardHeader, DashboardWrapper, ProcessAction, ProcessItem, ProcessInfo, CardAction, CardText, CardTitle, CardsGrid, ProcessCard, Subtitle, Title } from './styles.js'
import MainLayout from '../../layout/MainLayout.jsx';
import Footer from '../../components/Footer/index.jsx';
import { useNavigate } from 'react-router-dom';
import { LiaFileContractSolid } from "react-icons/lia";
import { GiArchiveResearch } from "react-icons/gi";
import { TbReportAnalytics } from "react-icons/tb";


const OPTIONS = [
    {
        id: "contratos",
        title: "CONTRATOS",
        desc: "Gerenciamento de contratos e títulos de posse.",
        route: "/contratos",
        icon: LiaFileContractSolid,
    },
    {
        id: "relatorios",
        title: "RELATÓRIOS",
        desc: "Visualização de dados operacionais do cemitério, sepultamentos, exumações e taxas.",
        route: "/relatorios",
        icon: TbReportAnalytics,
    },
    {
        id: "registros",
        title: "REGISTROS",
        desc: "Gerenciamento e consulta de dados dos falecidos.",
        route: "/registros",
        icon: GiArchiveResearch,
    }
]

export default function ProcessSelection() {
    const navigate = useNavigate();
    return (
        <>
            <MainLayout>
                <Container>
                    <DashboardWrapper>
                        <Card>
                            <CardHeader>SELEÇÃO DE PROCESSOS </CardHeader>
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
            </MainLayout>
            <Footer />
        </>
    )
}
