class Session {
    constructor(){
        this.id = null;
        this.customer = null;
        this.fecha_visita = new Date();
        this.creatorUser = "";

        // Pestañas

        // Datos
        this.peso = "";	
        this.altura = "";	
        this.IMC = "";	
        this.perimetro_torax = "";
        this.perimetro_abd = "";
        this.pectus_normal = 1;
        this.TAS_MSD = "";
        this.TAD_MSD = "";	
        this.TAS_MSI = "";
        this.TAD_MSI = "";
        this.expl_patolog = "";
        this.fumador = 0; // Select
        this.alcohol = 0; // Select

        // TTO
        this.IECA = 0;
        this.cual_IECA = "";
        this.dosis_IECA = 0;
        this.ARA_II = 0;
        this.cual_ARA_II = "";
        this.dosis_ARA_II = 0;
        this.DIU_TIAZ = 0;
        this.cual_DIU_TIAZ = "";
        this.dosis_DIU_TIAZ = 0;
        this.ACA_DHP = 0;
        this.cual_ACA_DHP = "";
        this.dosis_ACA_DHP = 0;
        this.verap_dilt = 0;
        this.dosis_verap_dilt = 0;
        this.alfabloq = 0;
        this.cual_alfabloq = "";
        this.dosis_alfabloq = 0;
        this.betabloq = 0;
        this.cual_betabloq = "";
        this.dosis_betabloq = 0;
        this.aldost_inh = 0;
        this.cual_aldost_inh = "";
        this.dosis_aldost_inh = 0;
        this.diu_asa = 0;
        this.cual_diu_asa = "";
        this.dosis_diu_asa = 0;
        this.aliskiren = 0;
        this.dosis_aliskiren = 0;
        this.AAS = 0;
        this.clopidogrel = 0;
        this.ACO = 0;
        this.ESTATINAS = 0;
        this.METFORMINA = 0;
        this.SFU = 0;
        this.GLICLAZ = 0;
        this.GLITAZONAS = 0;
        this.IDPP4 = 0;
        this.SGLT2 = 0;
        this.GLP1 = 0;
        this.INSULINA = 0;
        this.test_morisky_green = 0; // select
        
        // ECG
        this.fecha_ECG	 = "";
        this.ritmo = 0; //select
        this.FC = 0;
        this.PR = 0;
        this.QRS = 0;
        this.QTc = 0;
        this.EJE_P = null;
        this.EJE_QRS = null;
        this.EJE_T = null;
        this.P_anchura = 0;
        this.P_altura = 0;
        this.P_mellada = 0; //Boolean
        this.P_en_V1_1mm = 0;//Boolean
        this.Q_patologica = 0;//Boolean
        this.Q_I_y_aVL_no_patolog = 0;//Boolean
        this.Q_inferior_no_patolog = 0;//Boolean
        this.Q_V3_4_no_patolog = 0;//Boolean
        this.Q_V5_6_no_patolog = 0;//Boolean
        this.muesca_inf_QRS = 0;//Boolean
        this.muesca_lat_QRS = 0;//Boolean
        this.muesca_ant_QRS = 0;//Boolean
        this.R_en_I = 0;
        this.R_en_III = 0;
        this.R_en_aVF = 0;
        this.R_en_aVL = 0;
        this.R_en_V2 = 0;
        this.R_en_V5 = 0;
        this.R_en_V6 = 0;
        this.S_en_I = 0;
        this.S_en_II = 0;
        this.S_en_III = 0;
        this.S_en_V1 = 0;
        this.S_en_V3 = 0;
        this.S_en_V6 = 0;
        this.bloqueos_rama = 0;  //select
        this.hemibloqueos = 0;  //select
        this.Sokolow = 0;
        this.Cornell = 0;
        this.ST = 0;  //select
        this.ST_alterado = 0; //select
        this.extrasistoles = 0; //select
        this.t_cara_inferior = 0; //select
        this.t_cara_lateral = 0; //select
        this.t_cara_septal = 0; //select
        this.t_cara_anterior = 0; //select
        this.t_cara_lateral_alta = 0; //select

        // AP
        this.fumador = 0; // select
        this.cigarrillos = 0; // number
        this.alcohol = 0; // select
        this.sal = 0; // select
        this.dieta_mediterranea	 = 0; // select
        this.ejercicio_fisico = 0; // select
        this.HTA = 0; // boolean
        this.años_HTA = 0;
        this.HTA_secundaria = 0; // boolean
        this.causa_HTA_secund = 0; // boolean
        this.Dgtco_HTA = 0;
        this.AF_HTA = 0;
        this.AF_MS = 0;
        this.AF_C_Isq_precoz = 0;
        this.HTA_controlada = 1;
        this.DM = 0;
        this.fecha_dgtco_DM = "";
        this.DLP = 0;
        this.IC = 0;
        this.fecha_dgtco_IC = "";
        this.FA = 0;
        this.fecha_dgtco_FA = "";
        this.ictus = 0;
        this.fecha_dgtco_ictus = "";
        this.carotidas = 0;
        this.fecha_dgtco_carotidas = "";
        this.claudicacion_intermitente = 0;
        this.fecha_dgtco_claudicacion = "";
        this.cardiop_isquemica = 0;
        this.fecha_cardiop_isquemica = "";
        this.disfuncionSexual = 0;
        this.SAOS = 0;
        this.EPOC = 0;
        this.gradodEPOC = 0;

        // Analitica
        this.analitica_basal = 0;
        this.fecha_analitica = "";
        this.hb = "";
        this.hcto = "";
        this.VCM = "";
        this.CHCM = "";
        this.plaquetas = "";
        this.glucosa = "";
        this.hb1Ac = "";
        this.urea = "";
        this.creatinina = "";
        this.FG = "";
        this.Na = "";
        this.K = "";
        this.GOT = "";
        this.GPT = "";
        this.GGT = "";
        this.CT = "";
        this.LDL = "";
        this.HDL = "";
        this.TG = "";
        this.microalbuminuria = "";
        this.cociente_alb_cr = "";
        this.proteinuria = "";

        // Pruebas
        this.mapa_reciente = 0; //bool
        this.mapa_diurna = 0;
        this.mapa_nocturno = 0;
        this.dip = 0;
        this.ecocardio = 0;
        this.fecha_ecocardio = "";
        this.DTDVI = 0;
        this.septo = 0;
        this.masa = 0;
        this.AI = 0;
        this.FEVI = 0;
        this.diastole = 0; //select
        this.valvulopatia = 0; //select
        this.fondo_ojo = 0;//bool
        this.fecha_fondo_ojo = ""; 
        this.fondo_ojo_patologico = 0; //select
        this.renal_estudio = 0; //bool
        this.patologia_renal = 0; //bool
        this.cual_patologia_renal = "";
        this.proteinuria = 0;
        
    }
}

module.exports = Session;