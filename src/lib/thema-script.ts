export const THEMA_SLEUTEL = "studiekompas:thema";

/** Script dat vóór het tekenen van de pagina het gekozen thema zet (voorkomt een witte flits) */
export const THEMA_SCRIPT = `try{var t=localStorage.getItem("${THEMA_SLEUTEL}");if(t==="licht")document.documentElement.dataset.theme="light";else if(t==="donker")document.documentElement.dataset.theme="dark"}catch(e){}`;
