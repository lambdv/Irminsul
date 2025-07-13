"use client"
import { useState, useEffect } from "react"
import { getCharacters, getWeapons, getArtifacts } from "@/utils/genshinData"
import { getAssetURL } from "@/utils/getAssetURL"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Paper,
    Tabs,
    Tab,
    Box,
    Dialog,
    DialogContent,
    Typography,
    Container,
    ThemeProvider,
    createTheme,
    CssBaseline
} from '@mui/material'
import Image from 'next/image'
import { toKey } from "@/utils/standardizers"
import Head from "next/head"
import { redirect } from "next/navigation"
import { isAdmin } from "@/app/(auth)/actions"


export default function Page() {

    // useEffect(() => {
    //     async function checkAdmin() {
    //         const allowed = await isAdmin()
    //         if(!allowed)
    //             redirect("/")
    //     }
    //     checkAdmin()
    // }, [])

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',

            primary: {
                main: '#E7C073'
            },

        },
    });

    const [currentTab, setCurrentTab] = useState(0)
    const [characters, setCharacters] = useState([])
    const [weapons, setWeapons] = useState([])
    const [artifacts, setArtifacts] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [modalContent, setModalContent] = useState(null)
    
    useEffect(() => {
        async function fetchData() {
            const characters = await getCharacters()
            const weapons = await getWeapons()
            const artifacts = await getArtifacts()
            setCharacters(characters)
            setWeapons(weapons)
            setArtifacts(artifacts)
        }
        fetchData()
    }, [])

    const handleModalClose = () => {
        setModalOpen(false)
        setModalContent(null)
    }

    

    function DataTable({ data, category }) {
        if (!data.length) return null
        
        return (
            <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ py: 1, px: 2, fontSize: '1rem' }}>IMAGE</TableCell>
                            {Object.keys(data[0]).map((key) => (
                                key !== 'alt' && 
                                <TableCell 
                                    key={key} 
                                    sx={{ 
                                        py: 1, 
                                        px: 2, 
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                        }
                                    }}
                                    onClick={() => {
                                        let sortDirection = 'asc';
                                        const sorted = [...data].sort((a, b) => {
                                            if (sortDirection === 'asc') {
                                                if (a[key] < b[key]) return -1;
                                                if (a[key] > b[key]) return 1;
                                            } else {
                                                if (a[key] < b[key]) return 1; 
                                                if (a[key] > b[key]) return -1;
                                            }
                                            return 0;
                                        });
                                        switch(category) {
                                            case "character":
                                                setCharacters(sorted);
                                                break;
                                            case "weapon": 
                                                setWeapons(sorted);
                                                break;
                                            case "artifact":
                                                setArtifacts(sorted);
                                                break;
                                        }
                                        
                                    }}
                                >
                                    {key.toUpperCase()}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow 
                                key={index}
                                hover
                                onClick={() => {
                                    setModalContent(JSON.stringify(item, null, 10))
                                    setModalOpen(true)
                                }}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell sx={{ py: 2, width: '48px', height: '48px' }}>
                                    {(()=>{
                                        let filename = ""
                                        switch(category){
                                            case "character":
                                                filename = "avatar.png"
                                                break
                                            case "weapon":
                                                filename = "base_avatar.png"
                                                break
                                            case "artifact":
                                                filename = "flower.png"
                                                break
                                        }
                                        const src = getAssetURL(category , item.id, filename)
                                        return (
                                            <Image 
                                                src={src} 
                                                alt={item.name}
                                                style={{ width: '100%', height: 'auto',  }}
                                                unoptimized={true}
                                                width={100}
                                                height={100} 
                                            />
                                        )
                                        
                                    })()}
                                </TableCell>
                                {Object.keys(item).map((key) => (
                                    key !== 'alt' &&
                                    <TableCell key={key} sx={{ py: 2, fontSize: '1rem', height: '2px', textWrap: 'nowrap' }}>
                                        {typeof item[key] === 'object' 
                                            ? JSON.stringify(item[key]).slice(0, 50) + "..."
                                            : String(item[key]).slice(0, 10) + (String(item[key]).length > 10 ? "..." : "")
                                        }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }

    const tabs = [
        { label: "Character Data", content: <DataTable data={characters} category="character" /> },
        { label: "Weapon Data", content: <DataTable data={weapons} category="weapon" /> },
        { label: "Artifact Data", content: <DataTable data={artifacts} category="artifact" /> }
    ]

    return (
        <ThemeProvider theme={darkTheme}>
            <Head>
                <title>Database</title>
            </Head>
            <CssBaseline />
            <Container maxWidth="xl" sx={{  py: 4 }}>
                <h1 style={{fontFamily: "ingame", fontSize: "2rem", fontWeight: "500", marginBottom: "20px"}}>Database</h1>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs 
                        value={currentTab} 
                        onChange={(_, newValue) => setCurrentTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {tabs.map((tab, index) => (
                            <Tab key={index} label={tab.label} />
                        ))}
                    </Tabs>
                </Box>

                {tabs[currentTab]?.content}

                <Dialog
                    open={modalOpen}
                    onClose={handleModalClose}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        style: {
                            maxHeight: '90vh',
                            maxWidth: '50vw',
                            overflow: 'auto',
                        },
                    }}
                >
                    <DialogContent>
                        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                            {modalContent}
                        </Typography>
                    </DialogContent>
                </Dialog>
            </Container>
        </ThemeProvider>
    )
}
