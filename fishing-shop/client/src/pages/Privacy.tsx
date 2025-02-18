import { Container, Typography, Box, Paper } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>GDPR - Adatvédelmi Tájékoztató | Jákó Díszállat és Horgász Szaküzlet</title>
        <meta 
          name="description" 
          content="Ismerje meg a Jákó Díszállat és Horgász Szaküzlet adatvédelmi irányelveit, személyes adatainak kezelését és az Önt megillető jogokat." 
        />
        <meta 
          name="keywords" 
          content="GDPR, adatvédelem, privacy policy, személyes adatok, adatkezelés, Jákó Díszállat, cookie szabályzat, békési horgászbolt" 
        />
        <meta property="og:title" content="GDPR - Adatvédelmi Tájékoztató | Jákó Díszállat és Horgász Szaküzlet" />
        <meta 
          property="og:description" 
          content="Ismerje meg adatvédelmi irányelveinket és személyes adatainak kezelését a Jákó Díszállat és Horgász Szaküzletben." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://jakobekes.com/privacy" />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Typography 
          variant="h1" 
          component="h1" 
          align="center"
          sx={{ 
            mb: 4,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 600
          }}
        >
          GDPR - Adatvédelmi Tájékoztató
        </Typography>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: 'background.default' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              1. Általános rendelkezések
            </Typography>
            <Typography paragraph>
              (1) Ön a www.jakobekes.com oldal (a továbbiakban: Oldal) használatával magára nézve kötelezőnek fogadja el a jelen Adatkezelési Tájékoztató rendelkezéseit. Adatkezelő a jelen Szabályzat tekintetében:
            </Typography>
            <Typography component="div" sx={{ mb: 2 }}>
              Név: Jákó Díszállat és Horgász Szaküzlet<br />
              Székhely: 5630 Békés, Szánthó Albert utca 4.<br />
              Email: info@jakobekes.com<br />
              Telefon: +30 471 7047
            </Typography>
            <Typography paragraph>
              (2) A jelen adatvédelmi tájékoztató célja, hogy meghatározza a kezelt személyes adatok körét, az adatkezelés módját, valamint biztosítsa az adatvédelem alkotmányos elveinek, az adatbiztonság követelményeinek érvényesülését, s megakadályozza az adatokhoz való jogosulatlan hozzáférést, az adatok megváltoztatását és jogosulatlan nyilvánosságra hozatalát vagy felhasználását, annak érdekében, hogy a felhasználó természetes személyek magánszférájának a tiszteletben tartása megvalósuljon.
            </Typography>
            <Typography paragraph>
              (3) A (2) bekezdésben megfogalmazott cél érdekében az Ön személyes adatait bizalmasan, a hatályos jogszabályi előírásokkal összhangban kezeljük, gondoskodunk azok biztonságáról, megtesszük azokat a technikai és szervezési intézkedéseket, valamint kialakítjuk azokat az eljárási szabályokat, amelyek a vonatkozó jogszabályi rendelkezések és más ajánlások érvényre juttatásához szükségesek.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              2. Jogszabályi háttér
            </Typography>
            <Typography paragraph>
              Az általunk végzett adatkezelésre elsősorban az alábbi jogszabályokban rögzített rendelkezések az irányadóak:
            </Typography>
            <ul>
              <Typography component="li" sx={{ mb: 1 }}>a Polgári Törvénykönyvről szóló 2013. évi V. törvény 2:43§ e.) pont („Ptk.")</Typography>
              <Typography component="li" sx={{ mb: 1 }}>az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. tv. („Adatvédelmi tv.");</Typography>
              <Typography component="li" sx={{ mb: 1 }}>az Európai Parlament és a Tanács (EU) 2016/679 Rendelete („GDPR")</Typography>
            </ul>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              3. Az adatkezelés jogalapja
            </Typography>
            <Typography paragraph>
              Az adatkezelés a felhasználó önkéntes hozzájárulásán alapul (GDPR 6. cikk (1) bek. a) pont).
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              4. Kezelt adatok Köre
            </Typography>
            <Typography paragraph>
              Oldalunkon történő üzenetküldés során a következő személyes adatokat kezeljük:
            </Typography>
            <ul>
              <Typography component="li" sx={{ mb: 1 }}>Név</Typography>
              <Typography component="li" sx={{ mb: 1 }}>Email cím</Typography>
              <Typography component="li" sx={{ mb: 1 }}>Telefonszám</Typography>
            </ul>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              5. Adatkezelés célja
            </Typography>
            <Typography paragraph>
              Az adatkezelés célja a beérkező üzenetek kezelése, az ügyfelek kérdéseire, megkereséseire való válaszadás.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              6. Adatkezelés időtartama
            </Typography>
            <Typography paragraph>
              Az adatokat a kapcsolatfelvétel lezárultát követően legfeljebb 6 hónapig tároljuk, ezt követően törlésre kerülnek.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              7. Az adatok továbbítása
            </Typography>
            <Typography paragraph>
              Az adatokat harmadik félnek nem adjuk át, és kizárólag az adatkezelő kezeli azokat.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              8. Adatbiztonság
            </Typography>
            <Typography paragraph>
              Az Ön személyes adatainak biztonsága kiemelten fontos számunkra. Megfelelő technikai és 
              szervezési intézkedéseket alkalmazunk az adatok védelme érdekében.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              9. Az érintettek jogai
            </Typography>
            <Typography paragraph>
              Az érintettek jogosultak:
            </Typography>
            <ul>
              <Typography component="li" sx={{ mb: 1 }}>Hozzáférni a személyes adataikhoz</Typography>
              <Typography component="li" sx={{ mb: 1 }}>Kérni azok helyesbítését</Typography>
              <Typography component="li" sx={{ mb: 1 }}>Kérni azok törlését</Typography>
              <Typography component="li" sx={{ mb: 1 }}>Korlátozni az adatkezelést</Typography>
              <Typography component="li" sx={{ mb: 1 }}>Tiltakozni az adatkezelés ellen</Typography>
            </ul>
          </Box>

          <Box>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2 }}>
              10. Jogorvoslati lehetőségek
            </Typography>
            <Typography paragraph>
              Jogsértés esetén jogorvoslatért fordulhat:
            </Typography>
            <Typography component="div" sx={{ mb: 2 }}>
              a.) a Nemzeti Adatvédelmi és Információszabadság Hatósághoz<br />
              Székhely: 1125 Budapest, Szilágyi Erzsébet fasor 22/c.<br />
              Postacím: 1530 Budapest, Pf. 5.<br />
              Telefon: 06 -1- 391-1400<br />
              Telefax: 06-1-391-1410<br />
              E-mail: ugyfelszolgalat@naih.hu
            </Typography>
            <Typography paragraph>
              b.) az Ön lakóhelye, ill. tartózkodási helye szerint illetékes Törvényszékhez.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Privacy; 