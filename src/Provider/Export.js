const utf8 = require('utf8');

export function JSONToCSVConvertor (JSONData, ReportHeader, ColumnHeaders) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
  
    var CSV = '';
    //Set Report title in first row or line
  
    ReportHeader.forEach(function(e) {
        CSV += e.value + '\r\n';
    });
  
    CSV += '\n';
  
    //This condition will generate the Label/Header
  
    var row = "";
  
    //This loop will extract the label from 1st index of on array
    for (var i in ColumnHeaders) {
        for(var j in ColumnHeaders[i]) {
            //Now convert each value to string and comma-separated
            row += ColumnHeaders[i][j] + ',';
        }
        //append Label row with line break
        row += '\r\n';
    }

    row = row.slice(0, -1);
    CSV += row + '\r\n\n';
  
    //1st loop is to extract each row
    for (i = 0; i < arrData.length; i++) {
        row = "";
  
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var indexData in arrData[i]) {
            row += '"' + arrData[i][indexData] + '",';
        }
  
        row.slice(0, row.length - 1);
  
        //add a line break after each row
        CSV += row + '\r\n';
    }
  
    if (CSV === '') {
        alert("Invalid data");
        return;
    }
  
    return CSV;
  }

 export function customerToCSV(customer, visits) {
    var data = [];
    
    data.push({
        id: customer.id,
        identificacion: customer.identificacion,
        nombre: utf8.encode(customer.nombre),
        apellido1: utf8.encode(customer.apellido1),
        apellido2: utf8.encode(customer.apellido2),
        sexo: customer.sexo,
        fecha_nacimiento: customer.fecha_nacimiento,
        edad_inclusion: customer.edad_inclusion,
        fecha_registro: customer.fecha_registro,
        creatorUser: customer.creatorUser,
    });
    for(var visitIndex in visits) {
        let visit = visits[visitIndex];
        data.push({
            // Campos del customer
            custo_id: "",
            custo_identificacion: "",
            custo_nombre: "",
            custo_apellido_1: "",
            custo_apellido_2: "",
            custo_sexo: "",
            custo_fecha_nacimiento: "",
            custo_edad_inclusion: "",
            custo_fecha_registro: "",
            custo_creatorUser: "",
            // Visitas
            fecha_visita: visit.fecha_visita,
            creatorUser: visit.creatorUser,
            // Datos personales
            peso: visit.peso,
            altura: visit.altura,
            IMC: visit.IMC,
            perimetro_torax: visit.perimetro_torax,
            perimetro_abd: visit.perimetro_abd,
            pectus_normal: visit.pectus_normal,
            TAS_MSD: visit.TAS_MSD,
            TAD_MSD: visit.TAD_MSD,
            TAS_MSI: visit.TAS_MSI,
            TAD_MSI: visit.TAD_MSI,
            expl_patolog: visit.expl_patolog,
            // TTO			
            IECA: visit.IECA, 
            cual_IECA: visit.cual_IECA, 
            dosis_IECA: visit.dosis_IECA, 
            ARA_II: visit.ARA_II, 
            cual_ARA_II: visit.cual_ARA_II, 
            dosis_ARA_II: visit.dosis_ARA_II, 
            DIU_TIAZ: visit.DIU_TIAZ, 
            cual_DIU_TIAZ: visit.cual_DIU_TIAZ, 
            dosis_DIU_TIAZ: visit.dosis_DIU_TIAZ, 
            ACA_DHP: visit.ACA_DHP, 
            cual_ACA_DHP: visit.cual_ACA_DHP, 
            dosis_ACA_DHP: visit.dosis_ACA_DHP, 
            verap_dilt: visit.verap_dilt, 
            dosis_verap_dilt: visit.dosis_verap_dilt, 
            alfabloq: visit.alfabloq, 
            cual_alfabloq: visit.cual_alfabloq, 
            dosis_alfabloq: visit.dosis_alfabloq, 
            betabloq: visit.betabloq, 
            cual_betabloq: visit.cual_betabloq, 
            dosis_betabloq: visit.dosis_betabloq, 
            aldost_inh: visit.aldost_inh, 
            cual_aldost_inh: visit.cual_aldost_inh, 
            dosis_aldost_inh: visit.dosis_aldost_inh, 
            diu_asa: visit.diu_asa, 
            cual_diu_asa: visit.cual_diu_asa, 
            dosis_diu_asa: visit.dosis_diu_asa, 
            aliskiren: visit.aliskiren, 
            dosis_aliskiren: visit.dosis_aliskiren, 
            AAS: visit.AAS, 
            clopidogrel: visit.clopidogrel, 
            ACO: visit.ACO, 
            ESTATINAS: visit.ESTATINAS, 
            METFORMINA: visit.METFORMINA, 
            SFU: visit.SFU, 
            GLICLAZ: visit.GLICLAZ, 
            GLITAZONAS: visit.GLITAZONAS, 
            IDPP4: visit.IDPP4, 
            SGLT2: visit.SGLT2, 
            GLP1: visit.GLP1, 
            INSULINA: visit.INSULINA, 
            test_morisky_green: visit.test_morisky_green, 
                        
            // ECG			
            fecha_ECG: visit.fecha_ECG, 
            ritmo: visit.ritmo , 
            FC: visit.FC, 
            PR: visit.PR, 
            QRS: visit.QRS, 
            QTc: visit.QTc, 
            EJE_P: visit.EJE_P, 
            EJE_QRS: visit.EJE_QRS, 
            EJE_T: visit.EJE_T, 
            P_anchura: visit.P_anchura, 
            P_altura: visit.P_altura, 
            P_mellada: visit.P_mellada , 
            P_en_V1_1mm: visit.P_en_V1_1mm, 
            Q_patologica: visit.Q_patologica, 
            Q_I_y_aVL_no_patolog: visit.Q_I_y_aVL_no_patolog, 
            Q_inferior_no_patolog: visit.Q_inferior_no_patolog, 
            Q_V3_4_no_patolog: visit.Q_V3_4_no_patolog, 
            Q_V5_6_no_patolog: visit.Q_V5_6_no_patolog, 
            muesca_inf_QRS: visit.muesca_inf_QRS, 
            muesca_lat_QRS: visit.muesca_lat_QRS, 
            muesca_ant_QRS: visit.muesca_ant_QRS, 
            R_en_I: visit.R_en_I, 
            R_en_III: visit.R_en_III, 
            R_en_aVF: visit.R_en_aVF, 
            R_en_aVL: visit.R_en_aVL, 
            R_en_V2: visit.R_en_V2, 
            R_en_V5: visit.R_en_V5, 
            R_en_V6: visit.R_en_V6, 
            S_en_I: visit.S_en_I, 
            S_en_II: visit.S_en_II, 
            S_en_III: visit.S_en_III, 
            S_en_V1: visit.S_en_V1, 
            S_en_V3: visit.S_en_V3, 
            S_en_V6: visit.S_en_V6, 
            bloqueos_rama: visit.bloqueos_rama  , 
            hemibloqueos: visit.hemibloqueos  , 
            Sokolow: visit.Sokolow, 
            Cornell: visit.Cornell, 
            ST:  visit.ST  , 
            ST_alterado: visit.ST_alterado , 
            extrasistoles: visit.extrasistoles , 
            t_en_I: visit.t_en_I,
            t_en_II: visit.t_en_II,
            t_en_III: visit.t_en_III,
            t_en_AVL: visit.t_en_AVL,
            t_en_AVF: visit.t_en_AVF,
            t_cara_septal: visit.t_cara_septal , 
            t_cara_anterior: visit.t_cara_anterior , 
            t_cara_lateral_alta: visit.t_cara_lateral_alta , 
                        
            // AP: visit.	
            fumador: visit.fumador, 
            cigarrillos: visit.cigarrillos , 
            alcohol: visit.alcohol, 
            sal: visit.sal, 
            dieta_mediterranea: visit.dieta_mediterranea, 
            ejercicio_fisico: visit.ejercicio_fisico, 
            HTA: visit.HTA , 
            años_HTA: visit.años_HTA, 
            HTA_secundaria: visit.HTA_secundaria , 
            causa_HTA_secund: visit.causa_HTA_secund , 
            Dgtco_HTA: visit.Dgtco_HTA, 
            AF_HTA: visit.AF_HTA, 
            AF_MS: visit.AF_MS, 
            AF_C_Isq_precoz: visit.AF_C_Isq_precoz, 
            HTA_controlada: visit.HTA_controlada, 
            DM: visit.DM, 
            fecha_dgtco_DM: visit.fecha_dgtco_DM, 
            DLP: visit.DLP, 
            IC: visit.IC, 
            fecha_dgtco_IC: visit.fecha_dgtco_IC, 
            FA: visit.FA, 
            fecha_dgtco_FA: visit.fecha_dgtco_FA, 
            ictus: visit.ictus, 
            fecha_dgtco_ictus: visit.fecha_dgtco_ictus, 
            carotidas: visit.carotidas, 
            fecha_dgtco_carotidas: visit.fecha_dgtco_carotidas, 
            claudicacion_intermitente: visit.claudicacion_intermitente, 
            fecha_dgtco_claudicacion: visit.fecha_dgtco_claudicacion, 
            cardiop_isquemica: visit.cardiop_isquemica, 
            fecha_cardiop_isquemica: visit.fecha_cardiop_isquemica, 
            disfuncionSexual: visit.disfuncionSexual, 
            SAOS: visit.SAOS, 
            EPOC: visit.EPOC, 
            gradodEPOC: visit.gradodEPOC, 
                        
            // Analitica			
            analitica_basal: visit.analitica_basal, 
            fecha_analitica: visit.fecha_analitica, 
            hb: visit.hb, 
            hcto: visit.hcto, 
            VCM: visit.VCM, 
            CHCM: visit.CHCM, 
            plaquetas: visit.plaquetas, 
            glucosa: visit.glucosa, 
            hb1Ac: visit.hb1Ac, 
            urea: visit.urea, 
            creatinina: visit.creatinina, 
            FG: visit.FG, 
            Na: visit.Na, 
            K: visit.K, 
            GOT: visit.GOT, 
            GPT: visit.GPT, 
            GGT: visit.GGT, 
            CT: visit.CT, 
            LDL: visit.LDL, 
            HDL: visit.HDL, 
            TG: visit.TG, 
            microalbuminuria: visit.microalbuminuria, 
            cociente_alb_cr: visit.cociente_alb_cr, 
            proteinuria: visit.proteinuria, 
                        
            // Pruebas			
            mapa_reciente: visit.mapa_reciente , 
            mapa_diurna: visit.mapa_diurna, 
            mapa_nocturno: visit.mapa_nocturno, 
            dip: visit.dip, 
            ecocardio: visit.ecocardio, 
            fecha_ecocardio: visit.fecha_ecocardio, 
            DTDVI: visit.DTDVI, 
            septo: visit.septo, 
            masa: visit.masa, 
            AI: visit.AI, 
            FEVI: visit.FEVI, 
            diastole: visit.diastole , 
            valvulopatia: visit.valvulopatia , 
            fondo_ojo: visit.fondo_ojo, 
            fecha_fondo_ojo: visit.fecha_fondo_ojo , 
            fondo_ojo_patologico: visit.fondo_ojo_patologico , 
            renal_estudio: visit.renal_estudio , 
            patologia_renal: visit.patologia_renal , 
            cual_patologia_renal: visit.cual_patologia_renal, 
            proteinuria_pruebas: visit.proteinuria_pruebas, 

        });
    }
    var header = [
        [
            // Campos del customer
            "Datos del paciente", "", "", "", "", "", "", "", "", "",
            // Visitas
            "Visitas", "",
            // Datos personales
            "Datos personales", "",  "", "", "", "", "", "", "", "", "",
            // TTO			
            "TTO", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",     
            // ECG			
            "ECG", "", "", "", "", "",  "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
            // AP:	
            "AP", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", "", "", "", "", "",      
            // Analitica			
            "Analitica", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
            // Pruebas			
            "Pruebas",  "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
        ],
        [
            // Datos paciente
            "ID", "Identificacion", "Nombre", "Apellido 1", "Apellido 2", "Sexo", "F.Nacimiento", "E.Inclusion","Registro","Registrado Por",
            // Visitas
            "Fecha visita", "Registro visita", 
            // Datos personales
            "Peso (Kg)", "Altura (cm)", "IMC", "Perimetro Torax", "Perimetro abdominal", "Pectus Normal", "TAS MSD", "TAD MSD", "TAS MSI", "TAD_MSI", "Exploracion Patologica",
            // TTO
            "IECA", "Cual IECA", "Dosis IECA (mg/dia)", "ARA II", "Cual ARA II", "Dosis ARA II", "DIU TIAZ", "Cual DIU TIAZ", "Dosis DIU TIAZ", "ACA DHP", "Cual ACA DHP", "Dosis ACA DHP", "Verap Dilt", "Dosis Verap Dilt", 
            "Alfabloq", "Cual Alfabloq", "Dosis Alfabloq", "Betabloq", "Cual Betabloq", "Dosis Betabloq", "ALDOST INH", "Cual ALDOST INH", "Dosis ALDOST INH", "DIU ASA", "Cual DIU ASA", "Dosis DIU ASA", "Aliskiren", 
            "Dosis Aliskiren", "AAS", "Clopidogrel", "ACO", "Estatinas", "Metformina", "SFU", "GLICLAZ", "GLITAZONAS", "IDPP4", "SGLT2", "GLP1", "Insulina", "Test Morisky Green",
            // ECG
            "Fecha del ECG", "Ritmo", "FC", "PR (milisegundos)", "QRS (milisegundos)", "QTc (milisegundos)", "Eje P",
            "Eje QRS", "Eje T", "P Altura (mm)", "P Mellada", "P en V1 > 1mm", "Q Patologica", "Q I y aVL no patologica", "Q  inferior no patologica",
            "Q V3-4 no patologica", "Q V5-6 no patologica", "Muesca Inferior QRS", "Muesca Lateral QRS", "Muesca Anterior QRS", "R en I (mm)", "R en III (mm)",
            "R en AVF (mm)", "R en AVL (mm)", "R en V2 (mm)", "R en V5 (mm)", "R en V6 (mm)", "S en I (mm)", "S en II (mm)", "S en III (mm)", "S en V1 (mm)",
            "S en V3 (mm)", "S en V6 (mm)", "Bloqueos Rama", "Hemibloqueos", "Indice de Sokolow-Lyon", "Indice de Cornell", "ST", "ST Alterado",
            "Extrasistoles", "T en I", "T en II", "T III", "T AVF", "T AVL", "T en V2", "T Cara Anterior (V3 - V4)", "T Cara Lateral Alta (V5 - V6)",
            // AP
            "Fumador", "Cigarrillos", "Alcohol", "Sal", "Dieta Mediterranea", "Ejercicio fisico", "HTA", "Años HTA", "HTA Secundaria",
            "Causa HTA Secundaria", "Diagnotico HTA", "AF MS", "AF C Isq. precoz", "HTA Controlada", "DM", "Fecha de diagnostico DM", "DLP", "Insuficiencia Cardiaca (IC)",
            "Fecha de diagnostico IC", "FA", "Fecha de diagnostico FA", "Ictus", "Fecha de diagnostico Ictus", "Carotidas", "Fecha de diagnostico carotidas",
            "Claudicacion intermitente (CInt)", "Fecha de diagnostico CInt", "Cardiopatia Isquemica (CI)", "Fecha de diagnostico CI", "Disfuncion Sexual", "SAOS",
            "EPOC", "Grado EPOC",
            // Analitica
            "Analitica basal", "Fecha analitica", "Hb", "Htco", "VCM", "CHCM", "Plaquetas", "Glucosa", "hb1Ac","Urea", "Creatinina", "FG", "Na", "K", "GOT", "GPT", "GGT", 
            "CT", "LDL", "HDL", "TG", "Microalbuminuria", "Cociente Alb/cr", "Proteinuria",
            // Pruebas
            "Mapa Reciente?", "Mapa Diurna", "Mapa Nocturno", "Dip", "Ecocardio", "Fecha Ecocardio", "DTDVI", "Septo ", "Masa", "AI", "FEVI", "Diastole", "Valvulopatia", 
            "Fondo ojo", "Fecha Fondo Ojo", "Fondo ojo patologico", "Estudio Renal ", "Patologia Renal", "Que patologia renal?", "Proteinuria ",
        ]
    ];

    return new Blob( [
        JSONToCSVConvertor(
            data,
            [
                { value: "Export: "},
            ],
            header
        )
        ], {type: 'text/csv'});
 }