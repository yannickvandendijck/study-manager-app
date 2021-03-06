import { SurveyEditor } from "../../../editor-engine/survey-editor/survey-editor";
import { generateLocStrings, generateTitleComponent, generateHelpGroupComponent, expWithArgs } from "../../../editor-engine/utils/simple-generators";
import { SurveyGroupItem, SurveyItem, Survey, Expression } from "survey-engine/lib/data_types";
import { ItemEditor } from "../../../editor-engine/survey-editor/item-editor";
import { initSingleChoiceGroup, initMultipleChoiceGroup, initDropdownGroup, initSliderCategoricalGroup, initMatrixQuestion, ResponseRowCell } from "../../../editor-engine/utils/question-type-generator";
import { ComponentEditor } from "../../../editor-engine/survey-editor/component-editor";
import { CoronaVaccineQuestions } from "../questions/coronaVaccine";

const responseGroupKey = 'rg';
const singleChoiceKey = 'scg';
const multipleChoiceKey = 'mcg';
const dropDownKey = 'ddg'
const sliderCategoricalKey = "scc"
const inputKey = "ic"
const matrixKey = "mat"

const generateNLWeekly = (): Survey | undefined => {
    const surveyKey = 'weekly';

    const survey = new SurveyEditor();
    survey.changeItemKey('survey', surveyKey);

    // define name and description of the survey
    survey.setSurveyName(generateLocStrings(
        new Map([
            ["en", "How do you feel today?"],
            ["nl", "Wekelijkse vragenlijst"],
        ])
    ));
    survey.setSurveyDescription(generateLocStrings(
        new Map([
            ["en", "Survey about your health status in the last week."],
            ["nl", "Klik hier voor je vragenlijst over je klachten in de afgelopen week. Meld alsjeblieft ook als je geen klachten had."],
        ])
    ));

    survey.setSurveyDuration(generateLocStrings(
        new Map([
            ["en", "15 seconds to 3 minutes, depending on your symptoms."],
            ["nl", "Invullen duurt 15 seconden tot 3 minuten, afhankelijk van je klachten."],
        ])
    ));

    const rootItemEditor = new ItemEditor(survey.findSurveyItem('weekly') as SurveyGroupItem);
    rootItemEditor.setSelectionMethod({ name: 'sequential' });
    survey.updateSurveyItem(rootItemEditor.getItem());

    const rootKey = rootItemEditor.getItem().key;

    // COVID vaccination yes/no
    const Q_coronavaccine = CoronaVaccineQuestions.coronavaccine(rootKey, "Q2NL", true);
    survey.addExistingSurveyItem(Q_coronavaccine, rootKey);

    // COVID vaccination date
    const Q_coronavaccineWhen = CoronaVaccineQuestions.coronavaccineWhen(rootKey, "Q2aNL", Q_coronavaccine.key, true);
    survey.addExistingSurveyItem(Q_coronavaccineWhen, rootKey);

    // COVID vaccination which vaccin
    const Q_coronavaccineWhich = CoronaVaccineQuestions.coronavaccineWhich(rootKey, "Q2bNL", Q_coronavaccine.key, true);
    survey.addExistingSurveyItem(Q_coronavaccineWhich, rootKey);

    // COVID vaccination reason not
    const Q_coronavaccineReasonAgainst = CoronaVaccineQuestions.coronavaccineReasonAgainst(rootKey, "Q2cNL", Q_coronavaccine.key, true);
    survey.addExistingSurveyItem(Q_coronavaccineReasonAgainst, rootKey);

    // Test results yes/no
    const q1aNL = survey.addNewSurveyItem({ itemKey: 'Q1aNL' }, rootKey);
    if (!q1aNL) { return; }
    survey.updateSurveyItem(q1aNL_def(q1aNL));
    // ---------------------------------------------------------

    // Tested where
    const q1gNL = survey.addNewSurveyItem({ itemKey: 'Q1gNL' }, rootKey);
    if (!q1gNL) { return; }
    survey.updateSurveyItem(q1gNL_def(q1gNL, q1aNL.key));
    // ---------------------------------------------------------

    // Test payment
    const q1hNL = survey.addNewSurveyItem({ itemKey: 'Q1hNL' }, rootKey);
    if (!q1hNL) { return; }
    survey.updateSurveyItem(q1hNL_def(q1hNL, q1aNL.key));
    // ---------------------------------------------------------

    // Test results positive/negative
    const q1bNL = survey.addNewSurveyItem({ itemKey: 'Q1bNL' }, rootKey);
    if (!q1bNL) { return; }
    survey.updateSurveyItem(q1bNL_def(q1bNL, q1aNL.key));
    // ---------------------------------------------------------

    // Test PCR how long after symptoms
    const q1cNL = survey.addNewSurveyItem({ itemKey: 'Q1cNL' }, rootKey);
    if (!q1cNL) { return; }
    survey.updateSurveyItem(q1cNL_def(q1cNL, q1aNL.key));
    // ---------------------------------------------------------

    // Test SERO date
    const q1dNL = survey.addNewSurveyItem({ itemKey: 'Q1dNL' }, rootKey);
    if (!q1dNL) { return; }
    survey.updateSurveyItem(q1dNL_def(q1dNL, q1aNL.key));
    // ---------------------------------------------------------

    // Contact GGD
    const q1eNL = survey.addNewSurveyItem({ itemKey: 'Q1eNL' }, rootKey);
    if (!q1eNL) { return; }
    survey.updateSurveyItem(q1eNL_def(q1eNL, q1aNL.key));
    // ---------------------------------------------------------

    // Contact CoronaMelder app
    const q1fNL = survey.addNewSurveyItem({ itemKey: 'Q1fNL' }, rootKey);
    if (!q1fNL) { return; }
    survey.updateSurveyItem(q1fNL_def(q1fNL, q1aNL.key));
    // ---------------------------------------------------------


    // ------> Symptoms group
    const qg1 = survey.addNewSurveyItem({ itemKey: 'q1', isGroup: true }, rootKey);

    const qg1ItemEditor = new ItemEditor(qg1 as SurveyGroupItem);
    qg1ItemEditor.setSelectionMethod({ name: 'sequential' });
    survey.updateSurveyItem(qg1ItemEditor.getItem());

    const q1Key = qg1ItemEditor.getItem().key;

    // 1 title
    const q1_title = survey.addNewSurveyItem({ itemKey: 'title' }, q1Key);
    if (!q1_title) { return; }
    survey.updateSurveyItem(q1_title_def(q1_title));

    // general --------------------------------------
    const q1_1 = survey.addNewSurveyItem({ itemKey: '1' }, q1Key);
    if (!q1_1) { return; }
    survey.updateSurveyItem(q1_1_def(q1_1));
    // -----------------------------------------

    const anySymptomSelected = expWithArgs('responseHasOnlyKeysOtherThan', [q1Key, '1'].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '0');




    //survey.addNewSurveyItem({ itemKey: 'pb1', type: 'pageBreak' }, rootKey);

    // -------> HAS SYMPTOMS GROUP
    const hasSymptomGroup = survey.addNewSurveyItem({ itemKey: 'HS', isGroup: true }, rootKey);
    const hasSymptomGroupEditor = new ItemEditor(hasSymptomGroup as SurveyGroupItem);
    hasSymptomGroupEditor.setSelectionMethod({ name: 'sequential' });
    hasSymptomGroupEditor.setCondition(anySymptomSelected)
    survey.updateSurveyItem(hasSymptomGroupEditor.getItem());

    const hasSymptomGroupKey = hasSymptomGroupEditor.getItem().key;

    //survey.addNewSurveyItem({ itemKey: 'pbQ3', type: 'pageBreak' }, hasSymptomGroupKey);

    // Q2 same illnes --------------------------------------
    const q2 = survey.addNewSurveyItem({ itemKey: 'Q2' }, hasSymptomGroupKey);
    if (!q2) { return; }
    survey.updateSurveyItem(q2_def(q2));
    // -----------------------------------------

    // Q3 when first symptoms --------------------------------------
    const q3 = survey.addNewSurveyItem({ itemKey: 'Q3' }, hasSymptomGroupKey);
    if (!q3) { return; }
    survey.updateSurveyItem(q3_def(q3, q2.key));
    // -----------------------------------------

    // Q4 when symptoms end --------------------------------------
    const q4 = survey.addNewSurveyItem({ itemKey: 'Q4' }, hasSymptomGroupKey);
    if (!q4) { return; }
    survey.updateSurveyItem(q4_def(q4, q3.key));
    // -----------------------------------------

    // Q5 symptoms developed suddenly --------------------------------------
    const q5 = survey.addNewSurveyItem({ itemKey: 'Q5' }, hasSymptomGroupKey);
    if (!q5) { return; }
    survey.updateSurveyItem(q5_def(q5));
    // -----------------------------------------

    // survey.addNewSurveyItem({ itemKey: 'pb7', type: 'pageBreak' }, rootKey);

    //survey.addNewSurveyItem({ itemKey: 'pbFever', type: 'pageBreak' }, hasSymptomGroupKey);

    // ----> fever group
    const feverGroup = survey.addNewSurveyItem({ itemKey: 'Q6', isGroup: true }, hasSymptomGroupKey);
    const feverGroupEditor = new ItemEditor(feverGroup as SurveyGroupItem);
    feverGroupEditor.setSelectionMethod({ name: 'sequential' });
    feverGroupEditor.setCondition(
        expWithArgs('responseHasKeysAny', [q1Key, '1'].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '1')
    )
    survey.updateSurveyItem(feverGroupEditor.getItem());

    const feverGroupKey = feverGroupEditor.getItem().key;

    // Q6 when fever began --------------------------------------
    const q6a = survey.addNewSurveyItem({ itemKey: 'a' }, feverGroupKey);
    if (!q6a) { return; }
    survey.updateSurveyItem(q6a_def(q6a));
    // -----------------------------------------

    // Q6b fever developed suddenly --------------------------------------
    const q6b = survey.addNewSurveyItem({ itemKey: 'b' }, feverGroupKey);
    if (!q6b) { return; }
    survey.updateSurveyItem(q6b_def(q6b));
    // -----------------------------------------

    // Q6c took temperature --------------------------------------
    const q6c = survey.addNewSurveyItem({ itemKey: 'c' }, feverGroupKey);
    if (!q6c) { return; }
    survey.updateSurveyItem(q6c_def(q6c));
    // -----------------------------------------

    // Q6d highest temperature --------------------------------------
    const q6d = survey.addNewSurveyItem({ itemKey: 'd' }, feverGroupKey);
    if (!q6d) { return; }
    survey.updateSurveyItem(q6d_def(q6d, q6c.key));
    // -----------------------------------------
    // <------ fever group


    // survey.addNewSurveyItem({ itemKey: 'pbContact', type: 'pageBreak' }, hasSymptomGroupKey);
    // -----> contact/visit group
    const contactGroup = survey.addNewSurveyItem({ itemKey: 'contact', isGroup: true }, hasSymptomGroupKey);
    const contactGroupEditor = new ItemEditor(contactGroup as SurveyGroupItem);
    contactGroupEditor.setSelectionMethod({ name: 'sequential' });
    // contactGroupEditor.setCondition(anySymptomSelected)
    survey.updateSurveyItem(contactGroupEditor.getItem());

    const contactGroupKey = contactGroupEditor.getItem().key;

    // Q7 visited medical service --------------------------------------
    const q7 = survey.addNewSurveyItem({ itemKey: 'Q7' }, contactGroupKey);
    if (!q7) { return; }
    survey.updateSurveyItem(q7_def(q7));
    // -----------------------------------------

    // Q7a visited GP practice --------------------------------------
    const q7a = survey.addNewSurveyItem({ itemKey: 'Q7a' }, contactGroupKey);
    if (!q7a) { return; }
    survey.updateSurveyItem(q7a_def(q7a, q7.key));
    // -----------------------------------------

    // Q7b how soon visited medical service --------------------------------------
    const q7b = survey.addNewSurveyItem({ itemKey: 'Q7b' }, contactGroupKey);
    if (!q7b) { return; }
    survey.updateSurveyItem(q7b_def(q7b, q7.key));
    // -----------------------------------------

    // Q8 contacted medical service --------------------------------------
    //const q8 = survey.addNewSurveyItem({ itemKey: 'Q8' }, contactGroupKey);
    //if (!q8) { return; }
    //survey.updateSurveyItem(q8_def(q8));
    // -----------------------------------------

    // Q8b how soon contacted medical service --------------------------------------
    //const q8b = survey.addNewSurveyItem({ itemKey: 'Q8b' }, contactGroupKey);
    //if (!q8b) { return; }
    //survey.updateSurveyItem(q8b_def(q8b, q8.key));
    // -----------------------------------------

    // test serological result --------------------------------------
    //const qcov16c = survey.addNewSurveyItem({ itemKey: 'Qcov16c' }, hasSymptomGroupKey);
    //if (!qcov16c) { return; }
    //survey.updateSurveyItem(qcov16c_def(qcov16c, qcov16.key));
    // -----------------------------------------
    // <----- contact/visit group

    // survey.addNewSurveyItem({ itemKey: 'pb10', type: 'pageBreak' }, rootKey);

    //survey.addNewSurveyItem({ itemKey: 'pbMedication', type: 'pageBreak' }, rootKey);
    // Q9 took medication --------------------------------------
    const q9 = survey.addNewSurveyItem({ itemKey: 'Q9' }, hasSymptomGroupKey);
    if (!q9) { return; }
    survey.updateSurveyItem(q9_def(q9));
    // -----------------------------------------

    // Q9b how soon after symptoms taking antivirals --------------------------------------
    const q9b = survey.addNewSurveyItem({ itemKey: 'Q9b' }, hasSymptomGroupKey);
    if (!q9b) { return; }
    survey.updateSurveyItem(q9b_def(q9b, q9.key));
    // -----------------------------------------

    // Q14 hospitalized because symptoms --------------------------------------
    // const q14 = survey.addNewSurveyItem({ itemKey: 'Q14' }, hasSymptomGroupKey);
    // if (!q14) { return; }
    // survey.updateSurveyItem(q14_def(q14));
    // -----------------------------------------

    //survey.addNewSurveyItem({ itemKey: 'pbChange', type: 'pageBreak' }, rootKey);
    // Q10 changed daily routine because illness --------------------------------------
    // const q10 = survey.addNewSurveyItem({ itemKey: 'Q10' }, hasSymptomGroupKey);
    // if (!q10) { return; }
    // survey.updateSurveyItem(q10_def(q10));
    // -----------------------------------------

    // Q10b still off work/school --------------------------------------
    // const q10b = survey.addNewSurveyItem({ itemKey: 'Q10b' }, hasSymptomGroupKey);
    // if (!q10b) { return; }
    // survey.updateSurveyItem(q10b_def(q10b, q10.key));
    // -----------------------------------------

    // Q10c still off work/school --------------------------------------
    // const q10c = survey.addNewSurveyItem({ itemKey: 'Q10c' }, hasSymptomGroupKey);
    // if (!q10c) { return; }
    // survey.updateSurveyItem(q10c_def(q10c, q10.key));
    // -----------------------------------------

    // Q10NL reported sick --------------------------------------
    const q10NL = survey.addNewSurveyItem({ itemKey: 'Q10NL' }, hasSymptomGroupKey);
    if (!q10NL) { return; }
    survey.updateSurveyItem(q10NL_def(q10NL));
    // -----------------------------------------

    // Q10bNL still off work/school --------------------------------------
    const q10bNL = survey.addNewSurveyItem({ itemKey: 'Q10bNL' }, hasSymptomGroupKey);
    if (!q10bNL) { return; }
    survey.updateSurveyItem(q10bNL_def(q10bNL, q10NL.key));
    // -----------------------------------------

    // Q10cNL nr days off work/school --------------------------------------
    const q10cNL = survey.addNewSurveyItem({ itemKey: 'Q10cNL' }, hasSymptomGroupKey);
    if (!q10cNL) { return; }
    survey.updateSurveyItem(q10cNL_def(q10cNL, q10NL.key));
    // -----------------------------------------
    //survey.addNewSurveyItem({ itemKey: 'pbCause', type: 'pageBreak' }, rootKey);

    // Q11 think cause of symptoms --------------------------------------
    const q11 = survey.addNewSurveyItem({ itemKey: 'Q11' }, hasSymptomGroupKey);
    if (!q11) { return; }
    survey.updateSurveyItem(q11_def(q11));
    // -----------------------------------------

    //q1aNL_def

    // Qcov9 think reasons having disease --------------------------------------
    //const qcov9 = survey.addNewSurveyItem({ itemKey: 'Qcov9' }, hasSymptomGroupKey);
    //if (!qcov9) { return; }
    //survey.updateSurveyItem(qcov9_def(qcov9, q11.key));
    // -----------------------------------------

    // Qcov9b informed contacts about suspicion COVID-19b infection --------------------------------------
    //const qcov9b = survey.addNewSurveyItem({ itemKey: 'Qcov9b' }, hasSymptomGroupKey);
    //if (!qcov9b) { return; }
    //survey.updateSurveyItem(qcov9b_def(qcov9b, q11.key));
    // -----------------------------------------

    // <------- HAS SYMPTOMS GROUP

    //survey.addNewSurveyItem({ itemKey: 'pbBehave', type: 'pageBreak' }, rootKey);
    // Qcov10 lockdown professional activity --------------------------------------
    //const qcov10 = survey.addNewSurveyItem({ itemKey: 'Qcov10' }, rootKey);
    //if (!qcov10) { return; }
    //survey.updateSurveyItem(qcov10_def(qcov10));
    // -----------------------------------------

    // Qcov11 frequency go out to buy products --------------------------------------
    //const qcov11 = survey.addNewSurveyItem({ itemKey: 'Qcov11' }, rootKey);
    //if (!qcov11) { return; }
    //survey.updateSurveyItem(qcov11_def(qcov11));
    // -----------------------------------------

    // Qcov12 frequency go out for fresh air or exercise --------------------------------------
    //const qcov12 = survey.addNewSurveyItem({ itemKey: 'Qcov12' }, rootKey);
    //if (!qcov12) { return; }
    //survey.updateSurveyItem(qcov12_def(qcov12));
    // -----------------------------------------

    // Qcov13 how many people nearer then 1 meter --------------------------------------
    //const qcov13 = survey.addNewSurveyItem({ itemKey: 'Qcov13' }, rootKey);
    //if (!qcov13) { return; }
    //survey.updateSurveyItem(qcov13_def(qcov13));
    // -----------------------------------------

    //survey.addNewSurveyItem({ itemKey: 'pbLockdown', type: 'pageBreak' }, rootKey);
    // Qcov14 situation if lockdown lifted, but childcare/schools closed --------------------------------------
    //const qcov14 = survey.addNewSurveyItem({ itemKey: 'Qcov14' }, rootKey);
    //if (!qcov14) { return; }
    //survey.updateSurveyItem(qcov14_def(qcov14));
    // -----------------------------------------

    // Qcov14b days work outside from home --------------------------------------
    //const qcov14b = survey.addNewSurveyItem({ itemKey: 'Qcov14b' }, rootKey);
    //if (!qcov14b) { return; }
    //survey.updateSurveyItem(qcov14b_def(qcov14b, qcov14.key));
    // -----------------------------------------

    // Qcov15 lockdown extended, would follow --------------------------------------
    //const qcov15 = survey.addNewSurveyItem({ itemKey: 'Qcov15' }, rootKey);
    //if (!qcov15) { return; }
    //survey.updateSurveyItem(qcov15_def(qcov15));
    // -----------------------------------------



    //survey.addNewSurveyItem({ itemKey: 'pblast', type: 'pageBreak' }, rootKey);

    const final_text = survey.addNewSurveyItem({ itemKey: 'finalText' }, rootKey);
    if (!final_text) { return; }
    survey.updateSurveyItem(qfinaltext_def(final_text));


    // q_postal_code -------------------------------------
    // const q_postal_code = survey.addNewSurveyItem({ itemKey: 'Q0' }, rootKey);
    // if (!q_postal_code) { return; }
    // survey.updateSurveyItem(q0_def(q_postal_code));
    // -----------------------------------------

    // console.log(q32Editor.findResponseComponent('rg'));
    // q32Editor.removeResponseComponent('rg.scg');

    console.log(survey.getSurvey());
    // console.log(survey.getSurveyJSON());


    // console.log(JSON.stringify(expOr, undefined, '  '));
    return survey.getSurvey();
}

export default generateNLWeekly;

const q1_title_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.addDisplayComponent(
        {
            role: 'text', content: generateLocStrings(new Map([
                ["en", "Please choose if you had any of the following symptoms since your last survey."],
                ["nl", "Geef alsjeblieft aan of je geen of tenminste één van de volgende klachten hebt gehad in de afgelopen week"],
            ]))
        }
    )
    return editor.getItem();
}



const qfinaltext_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.addDisplayComponent(
        {
            role: 'text', content: generateLocStrings(new Map([
                ["en", "This was all for now, please submit your responses. By filling out this survey regularly (eg. weekly), you can help us fight the virus."],
                ["nl", "Dit was de laatste vraag. Sla je antwoorden op door op verzenden te klikken. Dank voor het invullen. Volgende week vragen we je weer."],
            ]))
        }
    )
    return editor.getItem();
}

const q1_1_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you have any general symptoms such as"],
            ["nl", "Had je in de afgelopen week geen, één of meerdere van deze klachten? (chronische klachten hoeven hier niet gemeld te worden)"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '0', role: 'option', content: new Map([
                ["en", "No symptoms"],
                ["nl", "Nee, geen van deze klachten"],
            ])
        },
        {
            key: '1', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Fever"],
                ["nl", "Koorts"],
            ])
        },
        {
            key: '2', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Chills"],
                ["nl", "Koude rillingen"],
            ])
        },
        {
            key: '3', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Runny or blocked nose"],
                ["nl", "Loopneus of verstopte neus"],
            ])
        },
        {
            key: '4', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Sneezing"],
                ['nl', "Niezen"],
            ])
        },
        {
            key: '5', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Sore throat"],
                ["nl", "Zere keel"],
            ])
        },
        {
            key: '6', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Cough"],
                ["nl", "Hoesten"],
            ])
        },
        {
            key: '7', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Shortness of breath"],
                ["nl", "Kortademig (snel buiten adem)"],
            ])
        },
        {
            key: '8', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Headache"],
                ["nl", "Hoofdpijn"],
            ])
        },
        {
            key: '9', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Muscle/joint pain"],
                ["nl", "Spierpijn/Gewrichtspijn (niet sportgerelateerd)"],
            ])
        },
        {
            key: '10', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Chest pain"],
                ["nl", "Pijn op de borst"],
            ])
        },
        {
            key: '11', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Feeling tired or exhausted (malaise)"],
                ["nl", "Vermoeid en lamlendig (algehele malaise)"],
            ])
        },
        {
            key: '12', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Loss of appetite"],
                ["nl", "Verminderde eetlust"],
            ])
        },
        {
            key: '13', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Coloured sputum/phlegm"],
                ["nl", "Verkleurd slijm"],
            ])
        },
        {
            key: '14', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Watery, bloodshot eyes"],
                ["nl", "Waterige of bloeddoorlopen ogen"],
            ])
        },
        {
            key: '15', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Nausea"],
                ["nl", "Misselijkheid"],
            ])
        },
        {
            key: '16', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Vomiting"],
                ["nl", "Overgeven"],
            ])
        },
        {
            key: '17', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Diarrhoea (at least three times a day)"],
                ["nl", "Diarree (minstens 3 keer per dag)"],
            ])
        },
        {
            key: '18', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Stomach ache"],
                ["nl", "Buikpijn"],
            ])
        },
        {
            key: '19', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Loss of smell"],
                ["nl", "Geen reuk"],
            ])
        },
        {
            key: '20', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Loss of taste"],
                ["nl", "Geen smaak"],
            ])
        },
        {
            key: '21', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Nose bleed"],
                ["nl", "Bloedneus"],
            ])
        },
        {
            key: '22', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Rash"],
                ["nl", "Huiduitslag"],
            ])
        },

    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q2_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);

    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "On your last visit, you reported that you were still ill. Are the symptoms you report today part of the same bout of illness?"],
            ["nl", "In je laatste vragenlijst gaf je aan nog steeds klachten te hebben. Behoren de klachten die je nu meldt tot dezelfde klachtenperiode als de klachten die je de vorige keer al gemeld had?"],
            ["fr", "Lors de votre dernière visite, vous aviez déclaré être toujours malade. Est-ce que les symptômes que vous rapportez aujourd'hui font partie du même épisode de maladie?"],
        ]))
    );

    const hadOngoingSymptomsLastWeek = expWithArgs('eq', expWithArgs('getAttribute', expWithArgs('getAttribute', expWithArgs('getContext'), 'participantFlags'), 'prev'), "1");
    editor.setCondition(hadOngoingSymptomsLastWeek);

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To make filling out the rest of the survey quicker for you."],
                    ["nl", "Om te bepalen of je klachten worden veroorzaakt door (mogelijk) een nieuwe of dezelfde infectie als de vorige keer."],
                    ["fr", "Afin que vous puissiez remplir le reste de l'enquête plus rapidement."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "If you believe that the symptoms you have reported today are caused by the same bout of illness as your previous symptoms, please tick “yes”."],
                    ["nl", "Als je denkt dat de klachten die je vandaag raporteert nog worden veroorzaakt door dezelfde infectie/probleem (dezelfde klachtenperiode), beantwoord dan de vraag met 'Ja'"],
                    ["fr", "Si vous pensez que les symptômes que vous avez déclarés aujourd'hui sont causés par le même épisode de maladie que vos symptômes précédents, s'il vous plaît cochez «oui» . Pour gagner du temps, nous avons rempli les informations que vous nous avez déjà fournies sur votre maladie.  S'il vous plaît, vérifiez qu'elles sont toujours correctes ou faites les modifications nécessaires si, par exemple, vous avez consulté un médecin ou pris plus de temps hors travail depuis la dernière fois que vous avez répondu au questionnaire."],
                ]),
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["nl", "Ja"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "I don't know/can't remember"],
                ["nl", "Ik weet het niet (meer)."],
                ["fr", "Je ne sais pas / je ne m'en souviens plus"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q3_def = (itemSkeleton: SurveyItem, q2Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "When did the first symptoms appear?"],
            ["nl", "Op welke dag kwamen de eerste klachten opzetten? Als je de datum niet precies meer weet, kies dan een geschatte datum"],
            ["fr", " Quand les premiers symptômes sont-ils apparus?"],
        ]))
    );


    // const hadNOOngoingSymptomsLastWeek = expWithArgs('eq', expWithArgs('getAttribute', expWithArgs('getAttribute', expWithArgs('getContext'), 'participantFlags'), 'prev'), "0");
    editor.setCondition(expWithArgs('not', expWithArgs('responseHasKeysAny', [q2Key].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '0')));

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To help us work out the number of cases that arise each day."],
                    ["nl", "Dit helpt ons vast te stellen hoeveel mensen er klachten krijgen per dag."],
                    ["fr", "Pour nous aider à travailler sur le nombre de cas de grippe qui se déclarent chaque jour."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Please give as accurate an estimate as possible."],
                    ["nl", "Wees alsjeblieft zo nauwkeurig mogelijk."],
                    ["fr", "Donnez, s'il vous plaît, une estimation aussi précise que possible."],
                ]),
            },
        ])
    );
    // editor.setCondition(anySymptomSelected);


    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'dateInput',
            optionProps: {
                min: { dtype: 'exp', exp: expWithArgs('timestampWithOffset', -2592000) },
                max: { dtype: 'exp', exp: expWithArgs('timestampWithOffset', 10) },
            },
            content: new Map([
                ["en", "Choose date"],
                ["nl", "Kies de dag"],
                ["fr", "Sélectionner la date"],
            ])
        },
        //{
        //    key: '1', role: 'option',
        //    content: new Map([
        //        ["en", "I don't know/can't remember"],
        //        ["de", "Ich weiss es nicht bzw. kann mich nicht erinnern"],
        //       ["nl", "Ik weet het niet (meer)."],
        //        ["fr", "Je ne sais pas / je ne m'en souviens plus"],
        //    ])
        //},
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q4_def = (itemSkeleton: SurveyItem, q3Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "When did your symptoms end?"],
            ["nl", "Op welke dag waren je klachten weer verdwenen?"],
            ["fr", "Quand vos symptômes ont-ils disparu?"],
        ]))
    );
    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Using the beginning and end dates of symptoms we can work out how long respiratory infections last."],
                    ["nl", "Op basis van de eerste en laatste dag van klachten kunnen we uitrekenen hoelang je last hebt gehad van (deze) klachten."],
                    ["fr", "En utilisant les dates de début et de fin des symptômes, nous pouvons travailler sur la durée des infections respiratoires."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Please give as accurate an estimate as possible."],
                    ["nl", "Wees alsjeblieft zo nauwkeurig mogelijk."],
                    ["fr", "Donnez, s'il vous plaît, une estimation aussi précise que possible."],
                ]),
            },
        ])
    );
    // editor.setCondition(anySymptomSelected);

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'dateInput',
            optionProps: {
                min: {
                    dtype: 'exp', exp: {
                        name: 'getAttribute',
                        data: [
                            { dtype: 'exp', exp: expWithArgs('getResponseItem', q3Key, [responseGroupKey, singleChoiceKey, '0'].join('.')) },
                            { str: 'value', dtype: 'str' }
                        ],
                        returnType: 'int',
                    }
                },
                max: { dtype: 'exp', exp: expWithArgs('timestampWithOffset', 10) },
            },
            content: new Map([
                ["en", "Choose date"],
                ["nl", "Kies de dag"],
                ["fr", "Sélectionner la date"],
            ])
        },
        //{
        //    key: '1', role: 'option',
        //    content: new Map([
        //        ["en", "I don't know/can't remember"],
        //        ["de", "Ich weiss es nicht bzw. kann mich nicht erinnern"],
        //        ["nl", "Dit weet ik niet (meer)?"],
        //        ["fr", "Je ne sais pas / je ne m'en souviens plus"],
        //    ])
        //},
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "I am still ill"],
                ["nl", "Ik heb nog steeds klachten."],
                ["fr", "Je suis encore malade"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q5_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did your symptoms develop suddenly over a few hours?"],
            ["nl", "Kwamen je klachten plotseling opzetten? (binnen een paar uur)"],
            ["fr", "Est-ce que vos symptômes se sont déclarés soudainement, en l'espace de quelques heures?"],
        ]))
    );
    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Sudden onset of symptoms is believed to be common for flu."],
                    ["nl", "Dat klachten plotseling (binnen een paar uur) opzetten is gelinkt aan griep"],
                    ["fr", "L'apparition soudaine des symptômes est considéré comme commune pour la grippe."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Tick yes if your symptoms appeared over a few hours rather than gradually developing over a few days."],
                    ["nl", "Beantwoord de vraag met Ja wanneer de klachten binnen enkele uren kwamen opzetten, in plaats van een geleidelijke ontwikkeling over een aantal dagen."],
                    ["fr", "Cochez «oui» si vos symptômes sont apparus en quelques heures plutôt que progressivement sur quelques jours."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );
    // editor.setCondition(anySymptomSelected);

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["nl", "Ja"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "I don't know/can't remember"],
                ["nl", "Ik weet dit niet (meer)."],
                ["fr", "Je ne sais pas / je ne m'en souviens plus"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q6a_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "When did your fever begin?"],
            ["nl", "Op welke dag kwam de koorts opzetten? Als je de dag niet precies weet, kies dan een geschatte datum"],
            ["fr", " Quand est-ce que votre fièvre a commencé ?"],
        ]))
    );

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Fever is very important for diagnosing, so we want to know when this started."],
                    ["nl", "Koorts is belangrijk in de diagnose, daarom willen we graag weten wanneer deze klachten begonnen."],
                    ["fr", "La fièvre est très importante pour le diagnostic de la grippe. Nous voulons donc savoir quand cela a commencé."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Please give as accurate an estimate as possible."],
                    ["nl", "Wees alsjeblieft zo nauwkeurig mogelijk."],
                    ["fr", "Donnez, s'il vous plaît, une estimation aussi précise que possible."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'dateInput',
            optionProps: {
                min: { dtype: 'exp', exp: expWithArgs('timestampWithOffset', -21427200) },
                max: { dtype: 'exp', exp: expWithArgs('timestampWithOffset', 0) }
            },
            content: new Map([
                ["en", "Choose date"],
                ["nl", "Kies de dag"],
                ["fr", "Sélectionner la date"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "I don't know/can't rember"],
                ["nl", "Ik weet het niet (meer)."],
                ["fr", "Je ne sais pas / je ne m'en souviens plus"],
            ])
        },
    ]);

    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q6b_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did your fever develop suddenly over a few hours?"],
            ["nl", "Kwam de koorts plotseling opzetten? (binnen een paar uur)"],
            ["fr", "Est-ce que votre fièvre s'est déclarée soudainement, en l'espace de quelques heures?"],
        ]))
    );

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Certain illnesses are associated with a sudden onset of fever"],
                    ["nl", "Sommige ziekten veroorzaken een plotselinge koorts."],
                    ["fr", "La grippe est souvent associée à une apparition soudaine de fièvre."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Tick yes if your fever appeared over a few hours rather than gradually developing over a few days."],
                    ["nl", "Beantwoord de vraag met Ja wanneer de koorts binnen enkele uren kwam opzetten, in plaats van een geleidelijke ontwikkeling over een aantal dagen."],
                    ["fr", "Cochez «oui» si votre fièvre est apparue en quelques heures plutôt que progressivement sur quelques jours."],
                ]),
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["nl", "Ja"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "I don't know"],
                ["nl", "Dat weet ik niet (meer)"],
                ["fr", "Je ne sais pas"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q6c_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you take your temperature?"],
            ["nl", "Heb je de temperatuur gemeten?"],
            ["fr", "Avez-vous pris votre température?"],
        ]))
    );

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Infections often cause a high temperature. However, not everyone takes their temperature when they are ill."],
                    ["nl", "Infecties veroorzaken vaak een hoge temperatuur. Echter, niet iedereen meet hun temperatuur wanneer ze ziek zijn."],
                    ["fr", "La grippe est souvent associée à une température élevée. Cependant tout le monde ne prend pas sa température lorsqu'il est malade."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe moet ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Answer yes, if you took your temperature using a thermometer."],
                    ["nl", "Beantwoord deze vraag met Ja wanneer je de temperatuur hebt gemeten met een thermometer."],
                    ["fr", "Cochez «oui» si vous avez pris votre température à l'aide d'un thermomètre."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["nl", "Ja"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "I don't know"],
                ["nl", "Dat weet ik niet (meer)"],
                ["fr", "Je ne sais pas"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q6d_def = (itemSkeleton: SurveyItem, q6cKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "What was your highest temperature measured?"],
            ["nl", "Wat is je hoogst gemeten temperatuur?"],
            ["fr", " Quel a été votre température mesurée la plus élevée?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q6cKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1')
    )

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Certain infections often causes a high temperature."],
                    ["nl", "Bepaalde infectieziekten veroorzaken een hoge temperatuur."],
                    ["fr", "La grippe provoque souvent une température élevée."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Give the highest temperature you recorded during this episode of illness."],
                    ["nl", "Geef de hoogste temperatuur die je gemeten hebt tijdens je klachtenperiode."],
                    ["fr", "Indiquez la plus haute température que vous avez enregistrée au cours de cette épisode de maladie."],
                ]),
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Below 37.0°C"],
                ["nl", "Onder de 37,0°C"],
                ["fr", "Moins de 37°C"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "37.0° - 37.4°C"],
                ["nl", "37,0°C - 37,4°C"],
                ["fr", "37° – 37.4°C"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "37.5° - 37.9°C"],
                ["nl", "37,5° - 37,9°C"],
                ["fr", "37.5° – 37.9°C"],
            ])
        },
        {
            key: '4', role: 'option',
            content: new Map([
                ["en", "38.0° - 38.9°C"],
                ["nl", "38,0° - 38,9°C"],
                ["fr", "38° – 38.9°C"],
            ])
        },
        {
            key: '5', role: 'option',
            content: new Map([
                ["en", "39.0° - 39.9°C"],
                ["nl", "39,0° - 39,9°C"],
                ["fr", "39° – 39.9°C"],
            ])
        }, {
            key: '6', role: 'option',
            content: new Map([
                ["en", "40.0°C or more"],
                ["nl", "40,0°C of meer"],
                ["fr", "40°C ou plus"],
            ])
        },
        {
            key: '7', role: 'option',
            content: new Map([
                ["en", "I don't know/can't remember"],
                ["nl", "Dat weet ik niet (meer)."],
                ["fr", "Je ne sais pas / je ne m'en souviens plus"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q7_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, did you VISIT (see face to face) any medical services?"],
            ["nl", "Heb je een arts gezien of gesproken vanwege je klachten? En zo ja, waar? (meerdere antwoorden mogelijk)"],
            ["fr", "En raison de vos symptômes, avez-vous rendu visite (en personne) à des services médicaux ?"],
        ]))
    );
    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela ?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To find out whether people contact the health services because of their symptoms."],
                    ["nl", "Om uit te zoeken welk percentage van mensen met bepaalde klachten medische hulp zoeken."],
                    ["fr", "Pour savoir si la population entre en contact avec les services de santé en raison de ses symptômes."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre ?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Tick all of those that apply. If you are due to see attend, then tick the final option."],
                    ["nl", "Selecteer alle relevante vormen van medische hulp die je hebt bezocht. Wanneer je nog niet bent geweest maar wel een afspraak heeft gemaakt, selecteer dan de laatste optie."],
                    ["fr", "Merci de cocher toutes les réponses qui s'appliquent . Si vous avez rendez-vous prochainement, merci de cocher l'option finale."],
                ]),
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '0', role: 'option',
            disabled: expWithArgs('responseHasOnlyKeysOtherThan', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "No"],
                ["nl", "Nee, ik heb geen medische hulp gezocht"],
                ["fr", "Non"],
            ])
        },
        {
            key: '1', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '5'),
            content: new Map([
                ["en", "GP or GP's practice nurse"],
                ["nl", "Ja, bij de huisarts of huisartsassistent"],
                ["fr", "Médecin généraliste"],
            ])
        },
        {
            key: '3', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '5'),
            content: new Map([
                ["en", "Hospital accident & emergency department / out of hours service"],
                ["nl", "Ja, bij de eerste hulp van het ziekenhuis of de huisartsenpost"],
                ["fr", "Service des urgences d'un hôpital/clinique ou médecin de garde"],
            ])
        },
        {
            key: '2', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '5'),
            content: new Map([
                ["en", "Hospital admission"],
                ["nl", "Ja, ik ben opgenomen in het ziekenhuis"],
                ["fr", "Consultation ambulatoire à l'hôpital"],
            ])
        },
        {
            key: '4', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '5'),
            content: new Map([
                ["en", "Other medical services"],
                ["nl", "Ja, ik heb andere medische hulp gezocht"],
                ["fr", "Autre service médical"],
            ])
        },
        {
            key: '5', role: 'option',
            disabled: expWithArgs('responseHasOnlyKeysOtherThan', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '5'),
            content: new Map([
                ["en", "No, but I have an appointment scheduled"],
                ["nl", "Nog niet, maar ik heb een afspraak gemaakt"],
                ["fr", "Non, mais j'ai rendez-vous prochainement"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q7a_def = (itemSkeleton: SurveyItem, q7: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you visit the GP practice for your consult with the GP?"],
            ["nl", "Heb je de huisartspraktijk bezocht voor het gesprek met de huisarts/huisartsassistent?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q7].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '1')
    )

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Select the most relevant option"],
                    ["nl", "Geef aan of je ook de huisartspraktijk hebt bezocht."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No, the consult happend by phone or video-connection (video consult)"],
                ["nl", "Nee, ik heb de huisarts/huisartsassistent alleen gesproken per telefoon/video verbinding (video-consult)"],
            ])
        },

        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes, I went to the GP practice to consult the GP"],
                ["nl", "Ja, ik ben naar de huisartspraktijk gegaan, en heb daar met de huisarts/huisartsassistent gesproken"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q7b_def = (itemSkeleton: SurveyItem, q7: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "How soon after your symptoms appeared did you first VISIT a medical service?"],
            ["nl", "Waar en hoe snel na de start van je klachten heb je voor de EERSTE keer medische hulp gezocht?"],
            ["fr", "Combien de temps après que vos symptômes soient apparus avez-vous visité un service médical ?"],
        ]))
    );
    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela ?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To find out how quickly people with symptoms are seen by the health services."],
                    ["nl", "Om uit te zoeken hoe snel mensen met klachten worden gezien door een medische hulpdienst/specialist."],
                    ["fr", "Pour savoir à quelle vitesse les personnes présentant des symptômes sont vus par les services de santé."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment dois-je répondre ?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Only record the time until your FIRST contact with the health services."],
                    ["nl", "Geef alleen het aantal dagen van het begin van de klachten tot je EERSTE bezoek aan de desbetreffende medische hulpverlener/specialist."],
                    ["fr", "En saisissant le temps séparant l'apparition de vos symptômes et votre PREMIER contact avec les services de santé."],
                ]),
            },
        ])
    );

    editor.setCondition(
        expWithArgs('responseHasOnlyKeysOtherThan', q7, [responseGroupKey, multipleChoiceKey].join('.'), '0', '5')
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    editor.addExistingResponseComponent({
        role: 'text',
        content: generateLocStrings(
            new Map([
                ['en', 'Select the correct number of days'],
                ['nl', 'Selecteer het juiste aantal dagen'],
                ["fr", "sélectionnez toutes les options applicables"],
            ])),
    }, rg?.key);

    const ddOptions: ResponseRowCell = {
        key: 'col1', role: 'dropDownGroup', items: [
            {
                key: '0', role: 'option', content: new Map([
                    ["en", "Same day"],
                    ["nl", "Op dezelfde dag als de eerste klachten"],
                    ["fr", "Jour même"],
                ]),
            },
            {
                key: '1', role: 'option', content: new Map([
                    ["en", "1 day"],
                    ["nl", "1 dag"],
                    ["fr", "1 jour"],
                ]),
            },
            {
                key: '2', role: 'option', content: new Map([
                    ["en", "2 days"],
                    ["nl", "2 dagen"],
                    ["fr", "2 jours"],
                ]),
            },
            {
                key: '3', role: 'option', content: new Map([
                    ["en", "3 days"],
                    ["nl", "3 dagen"],
                    ["fr", "3 jours"],
                ]),
            },
            {
                key: '4', role: 'option', content: new Map([
                    ["en", "4 days"],
                    ["nl", "4 dagen"],
                    ["fr", "4 jours"],
                ]),
            },
            {
                key: '5', role: 'option', content: new Map([
                    ["en", "5 days"],
                    ["nl", "5 dagen"],
                    ["fr", "5 jours"],
                ]),
            },
            {
                key: '6', role: 'option', content: new Map([
                    ["en", "6 days"],
                    ["nl", "6 dagen"],
                    ["fr", "6 jours"],
                ]),
            },
            {
                key: '7', role: 'option', content: new Map([
                    ["en", "7 days"],
                    ["nl", "7 dagen"],
                    ["fr", "7 jours"],
                ]),
            },
            {
                key: '8', role: 'option', content: new Map([
                    ["en", "8 days"],
                    ["nl", "8 dagen"],
                    ["fr", "8 jours"],
                ]),
            },
            {
                key: '9', role: 'option', content: new Map([
                    ["en", "9 days"],
                    ["nl", "9 dagen"],
                    ["fr", "9 jours"],
                ]),
            },
            {
                key: '10', role: 'option', content: new Map([
                    ["en", "10 days"],
                    ["nl", "10 dagen"],
                    ["fr", "10 jours"],
                ]),
            },
            {
                key: '11', role: 'option', content: new Map([
                    ["en", "11 days"],
                    ["nl", "11 dagen"],
                    ["fr", "11 jours"],
                ]),
            },
            {
                key: '12', role: 'option', content: new Map([
                    ["en", "12 days"],
                    ["nl", "12 dagen"],
                    ["fr", "12 jours"],
                ]),
            },
            {
                key: '13', role: 'option', content: new Map([
                    ["en", "13 days"],
                    ["nl", "13 dagen"],
                    ["fr", "13 jours"],
                ]),
            },
            {
                key: '14', role: 'option', content: new Map([
                    ["en", "14 days"],
                    ["nl", "14 dagen"],
                    ["fr", "14 jours"],
                ]),
            },
            {
                key: '15', role: 'option', content: new Map([
                    ["en", "More than 14 days"],
                    ["nl", "meer dan 14 dagen"],
                    ["fr", "Plus de 14 jours"],
                ]),
            },
            {
                key: '16', role: 'option', content: new Map([
                    ["en", "I don't know/can't remember"],
                    ["nl", "Dat weet ik niet (meer)"],
                    ["fr", "Je ne sais pas / je ne m'en souviens plus"],
                ]),
            },
        ]
    };

    const rg_inner = initMatrixQuestion(matrixKey, [
        {
            key: 'header', role: 'headerRow', cells: [
                {
                    key: 'col0', role: 'text', content: new Map([
                        ["en", "Medical Service"],
                        ["nl", "Medische hulpverlener"],
                        ["fr", "Service médical"],
                    ]),
                },
                {
                    key: 'col1', role: 'text'
                },
            ]
        },
        {
            key: 'r1', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "GP or GP'r practice nurse"],
                        ["nl", "Huisarts of huisartsassistent"],
                        ["fr", "Médecin généraliste"],
                    ]),
                },
                { ...ddOptions }
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q7].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '1')
        },
        {
            key: 'r2', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "Hospital accident & department/out of hours service"],
                        ["nl", "Eerste hulp van het ziekenhuis of huisartsenpost"],
                        ["fr", "Service des urgences d'un hôpital/clinique ou médecin de garde"],
                    ]),
                },
                { ...ddOptions }
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q7].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '3')
        },
        {
            key: 'r3', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "Hospital admission"],
                        ["nl", "Ziekenhuisopname"],
                        ["fr", "Consultation ambulatoire à l'hôpital"],
                    ]),
                },
                { ...ddOptions }
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q7].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '2')
        },
        {
            key: 'r4', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "Other medical services"],
                        ["nl", "Andere medische hulp."],
                        ["fr", "Autre service médical"],
                    ]),
                },
                { ...ddOptions }
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q7].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '4')
        },
    ]);

    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q9_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you take medication for these symptoms?"],
            ["nl", "Heb je vanwege je klachten medicijnen gebruikt? En zo ja, welke?"],
            ["fr", "Avez-vous pris des médicaments pour ces symptômes ?"],
        ]))
    );

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To find out who gets treated, and how effective treatment is."],
                    ["nl", "Om uit te zoeken wie er medicatie neemt, en hoe effectief deze behandeling is."],
                    ["fr", "Pour savoir qui se fait soigner, et si le traitement est efficace."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe moet ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Only record those medications that you used because of this illness. If you are on other medications because of a pre-existing illness then do not record these."],
                    ["nl", "Geef alleen de medicatie aan die je gebruikt in verband met je gemelde klachten. Medicatie die je gebruikt voor een al bestaande aandoening hoef je niet te noemen."],
                    ["fr", "Ne saisissez que les médicaments que vous pris en raison de cette épisode de maladie. Si vous avez pris d'autres médicaments pour une maladie préexistante, alors ne les enregistrez pas."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );


    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    editor.addExistingResponseComponent({
        role: 'text',
        content: generateLocStrings(
            new Map([
                ['en', 'Select all options that apply'],
                ['nl', 'Meerdere antwoorden mogelijk'],
                ["fr", "sélectionnez toutes les options applicables"],
            ])),
    }, rg?.key);

    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '0',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '6'),
            content: new Map([
                ["en", "No medication"],
                ["nl", "Nee, ik heb geen medicijnen gebruikt"],
                ["fr", "Aucun médicament"],
            ])
        },
        {
            key: '1',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Pain killers (e.g. paracetamol, lemsip, ibuprofen, aspirin, calpol, etc)"],
                ["nl", "Ja, pijnstillers zoals paracetamol, aspirine of ibuprofen"],
                ["fr", "Médicaments contre la douleur ou la fièvre (p. ex. Paracetamol, Dafalgan, Ibuprofen, Aspirin, Pretuval, etc)"],
            ])
        },
        {
            key: '2',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Cough medication (e.g. expectorants)"],
                ["nl", "Ja, medicijnen om het hoesten te onderdrukken"],
                ["fr", "Médicaments contre la toux (p. ex. expectorants)"],
            ])
        },
        {
            key: '9',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Hayfever medication"],
                ["nl", "Ja, medicatie tegen hooikoorst"],

            ])
        },
        {
            key: '3',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Antivirals (Tamiflu, Relenza)"],
                ["nl", "Ja, antivirale middelen zoals Tamiflu of Relenza"],
                ["fr", "Antiviraux (par ex. Tamiflu)"],
            ])
        },
        {
            key: '4',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Antibiotics"],
                ["nl", "Ja, antibiotica"],
                ["fr", "Antibiotiques"],
            ])
        },
        {
            key: '7',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Homeopathy"],
                ["nl", "Ja, homeopathische middelen"],
                ["fr", "Homéopathie"],
            ])
        },
        {
            key: '8',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Alternative medicine (essential oil, phytotherapy, etc.)"],
                ["nl", "Ja, alternatieve medicatie (essentiële olie, fytotherapie enz.)"],
                ["fr", "Médecines douces (huiles essentielles, phytothérapie, etc.)"],
            ])
        },
        {
            key: '5',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0', '6'),
            content: new Map([
                ["en", "Other"],
                ["nl", "Ja, andere medicatie"],
                ["fr", "Autre"],
            ])
        },
        {
            key: '6',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "I don't know/can't remember"],
                ["nl", "Dit wil ik niet aangeven"],
                ["fr", "Je ne sais pas / je ne m'en souviens plus"],
            ])
        },

    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q9b_def = (itemSkeleton: SurveyItem, q9Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "How long after the beginning of your symptoms did you start taking antiviral medication?"],
            ["nl", "Hoe snel nadat je klachten opkwamen ben je begonnen met het gebruiken van antivirale middelen?"],
            ["fr", "Combien de temps après le début de vos symptômes avez-vous commencé à prendre des médicaments antiviraux ?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', q9Key, [responseGroupKey, multipleChoiceKey].join('.'), '3')
    )

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Antivirals are thought to be most effective if taken quickly after disease onset."],
                    ["nl", "Antivirale middelen werken beter wanneer ze snel worden genomen na het begin van de klachten."],
                    ["fr", "Les antiviraux sont supposés être plus efficace si pris rapidement après l'apparition de la maladie ."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Report the time until you first started taking antivirals (which may not be the same day as you got your prescription)."],
                    ["nl", "Geef het aantal dagen tussen het begin van de klachten en de dag dat je met de antivirale middelen begon."],
                    ["fr", "Signaler le temps écoulé jusqu'à ce que vous ayez commencé à prendre des antiviraux (qui peut ne pas être le même jour que celui ou vous avez obtenu votre prescription)."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "Same day (within 24 hours)"],
                ["nl", "Dezelfde dag (binnen 24 uur)"],
                ["fr", "Le jour même (dans les 24 heures)"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "1 day"],
                ["nl", "1 dag"],
                ["fr", "1 jour"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "2 days"],
                ["nl", "2 dagen"],
                ["fr", "2 jours"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "3 days"],
                ["nl", "3 dagen"],
                ["fr", "3 jours"],
            ])
        }, {
            key: '4', role: 'option',
            content: new Map([
                ["en", "4 days"],
                ["nl", "4 dagen"],
                ["fr", "4 jours"],
            ])
        }, {
            key: '5', role: 'option',
            content: new Map([
                ["en", "5-7 days"],
                ["nl", "5-7 dagen"],
                ["fr", "5 – 7 jours"],
            ])
        }, {
            key: '6', role: 'option',
            content: new Map([
                ["en", "More than 7 days"],
                ["nl", "Meer dan 7 dagen"],
                ["fr", "Plus de 7 jours"],
            ])
        }, {
            key: '7', role: 'option',
            content: new Map([
                ["en", "I don't know/can't remember"],
                ["nl", "Dat weet ik niet (meer)."],
                ["fr", "Je ne sais pas / je ne m'en souviens plus"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q10_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you change your daily routine because of your illness?"],
            ["nl", "Heb je vanwege je klachten je dagelijkse bezigheden moeten aanpassen?"],
            ["fr", "Avez-vous changé votre routine quotidienne en raison de votre maladie ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
                ["fr", "Non"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes, but I did not take time off work/school"],
                ["nl", "Ja, maar ik ben wel gewoon naar werk/school gegaan"],
                ["fr", "Oui, mais je n'ai pas pris congé au travail / à l'école"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Yes, I took time off work/school"],
                ["nl", "Ja, ik ben thuis gebleven terwijl ik eigenlijk naar werk/school had gemoeten"],
                ["fr", "Oui, j'ai pris congé au travail / à l'école"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q10b_def = (itemSkeleton: SurveyItem, q10Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Are you still off work/school?"],
            ["nl", "Blijf je nog steeds thuis in plaats van werk/school?"],
            ["fr", "Êtes-vous toujours en arrêt maladie ?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', q10Key, [responseGroupKey, singleChoiceKey].join('.'), '2')
    )

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To estimate the average  amount of time that people take off work, we need to know if people are still off work."],
                    ["nl", "Om uit te rekenen hoeveel dagen mensen thuisblijven vanwege klachten."],
                    ["fr", "Afin d'estimer le temps moyen que les gens passent en arrêt de travail."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Tick “yes” if you would be at work/school today if you were not currently ill."],
                    ["nl", "Antwoord 'Ja' als je vanwege klachten vandaag nog thuis zit in plaats van werk/school"],
                    ["fr", "Cochez «oui» si vous vous seriez rendu au travail / à l'école aujourd'hui si vous n'étiez pas actuellement malade."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["nl", "Ja"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Other (e.g. I wouldn’t usually be at work/school today anyway)"],
                ["nl", "Anders (ik hoefde vandaag sowieso niet naar werk/school)"],
                ["fr", "Autre (p. ex «Je ne me serais de toute façon pas rendu au travail / à l'école aujourd'hui»)"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q10c_def = (itemSkeleton: SurveyItem, q10Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "How long have you been off work/school?"],
            ["nl", "Hoeveel dagen ben je niet naar werk/school geweest (terwijl dat wel had gemoeten)?"],
            ["fr", "Combien de temps avez-vous été absent du travail / de l'école ?"],
        ]))
    );


    editor.setCondition(
        expWithArgs('responseHasKeysAny', q10Key, [responseGroupKey, singleChoiceKey].join('.'), '2')
    )

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To measure the effect of symptoms on people’s daily lives."],
                    ["nl", "Om het effect te bepalen van de klachten op je dagelijksleven"],
                    ["fr", "Afin de mesurer l'effet des symptômes sur la vie quotidienne des gens."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Only count the days that you normally would have been in school or work (e.g. don’t count weekends)."],
                    ["nl", "Tel alleen de dagen waar je normaal naar het werk/school had moeten gaan"],
                    ["fr", "Ne comptez que les jours durant lesquels vous seriez normalement allé à l'école ou au travail (par exemple, ne comptez pas le week-end)."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "1 day"],
                ["nl", "1 dag"],
                ["fr", "1 jour"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "2 days"],
                ["nl", "2 dagen"],
                ["fr", "2 jours"],
            ])
        }, {
            key: '3', role: 'option',
            content: new Map([
                ["en", "3 days"],
                ["nl", "3 dagen"],
                ["fr", "3 jours"],
            ])
        }, {
            key: '4', role: 'option',
            content: new Map([
                ["en", "4 days"],
                ["nl", "4 dagen"],
                ["fr", "4 jours"],
            ])
        },
        {
            key: '5', role: 'option',
            content: new Map([
                ["en", "5 days"],
                ["nl", "5 dagen"],
                ["fr", "5 jours"],
            ])
        }, {
            key: '6', role: 'option',
            content: new Map([
                ["en", "6 to 10 days"],
                ["nl", "6 tot 10 dagen"],
                ["fr", "6 à 10 jours"],
            ])
        }, {
            key: '7', role: 'option',
            content: new Map([
                ["en", "11 to 15 days"],
                ["nl", "11 tot 15 dagen"],
                ["fr", "11 à 15 jours"],
            ])
        }, {
            key: '8', role: 'option',
            content: new Map([
                ["en", "More than 15 days"],
                ["nl", "Meer dan 15 dagen"],
                ["fr", "Plus de 15 jours"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q11_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "What do you think is causing your symptoms?"],
            ["nl", "Heb je zelf enig idee waar je klachten vandaan komen?"],
            ["fr", "Quelle est selon vous l'origine de vos symptômes ?"],
        ]))
    );

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To help find out if our assessment of your illness based on your symptoms matches what you believe to be the cause. You might have a better idea of what is causing your illness than our computer algorithms."],
                    ["nl", "Om uit te zoeken of je eigen idee wat de oorzaak kan zijn past bij je eigen klachten, en klachten van anderen. Ook heb je waarschijnlijk een beter idee wat het zou kunnen zijn dan computer algoritmes."],
                    ["fr", "Pour nous aider à trouver si notre évaluation de votre maladie en fonction de vos symptômes correspond à ce que vous croyez en être la cause. Vous pourriez avoir une meilleure idée de ce qui est la cause de votre maladie que nos algorithmes informatiques ."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "If you are reasonably sure about what is causing your symptoms, please tick the appropriate box. Otherwise, please tick “I don’t know”."],
                    ["nl", "Ben je vrij zeker van de oorzaak van je klachten geef deze oorzaak dan aan."],
                    ["fr", "Si vous êtes raisonnablement sûr de ce qui est la cause de vos symptômes, s'il vous plaît cochez la case appropriée. Sinon, cochez la case «Je ne sais pas»."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "Flu or flu-like illness"],
                ["nl", "Ja, ik heb griep, of griepachtige verschijnselen"],
                ["fr", " Grippe ou syndrome pseudo-grippal"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Common cold"],
                ["nl", "Ja, ik ben verkouden"],
                ["fr", "Rhume / refroidissement"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Allergy/hay fever"],
                ["nl", "Ja ik heb last van een allergie/ hooikoorts"],
                ["fr", " Allergie / rhume des foins"],
            ])
        },
        {
            key: '6', role: 'option',
            content: new Map([
                ["en", "Ashtma"],
                ["nl", "Ja, ik heb last van astma"],
                ["fr", "Asthme"],
            ])
        }, {
            key: '3', role: 'option',
            content: new Map([
                ["en", "Gastroenteritis/gastric flu"],
                ["nl", "Ja, ik heb maag-darmklachten of buikgriep"],
                ["fr", "Gastro-entérite / grippe intestinale"],
            ])
        }, {
            key: '9', role: 'option',
            content: new Map([
                ["en", "New coronavirus (COVID-19)"],
                ["nl", "Ja, het nieuwe coronavirus (COVID-19)"],
                ["fr", "Nouveau coronavirus (COVID-19)"],
            ])
        }, {
            key: '4', role: 'option',
            content: new Map([
                ["en", "Other"],
                ["nl", "Ja, ik heb een andere ziekte of reden die de klachten hebben veroorzaakt"],
                ["fr", "Autre"],
            ])
        }, {
            key: '5', role: 'option',
            content: new Map([
                ["en", "I don't know"],
                ["nl", "Nee, ik heb geen idee"],
                ["fr", "Je ne sais pas"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

// Additional questions for the Dutch survey

const q1aNL_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you receive a corona test result since the last survey? (positive or negative?"],
            ["nl", "Heb je sinds de vorige vragenlijst een testuitslag (positief of negatief) gehad voor het nieuwe coronavirus?"],
        ]))
    );

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why do we ask this question?"],
                    ["nl", "Waarom vragen we dit?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To create an overview (over time) of how many participants tested positive"],
                    ["nl", "Om een overzicht te krijgen (over de tijd) hoeveel mensen binnen infectieradar al eens positief zijn getest"],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should you answer this question?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Please indicate your test result."],
                    ["nl", "Geef aan voor welke test je een uitslag hebt gehad."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No, I did not receive a test result"],
                ["nl", "Nee, ik heb geen testuitslag gehad"],
            ])
        },
        {
            key: '1', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Yes, I received the result of a throat/nose swap (PCR)"],
                ["nl", "Ja, ik heb een testuitslag gehad voor een keel/neus slijmvliestest"],
            ])
        },
        {
            key: '2', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Yes, I received the result of a bloodtest (antibodytest)"],
                ["nl", "Ja, ik heb een testuitslag gehad voor een bloedtest"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q1gNL_def = (itemSkeleton: SurveyItem, q1aNLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Where did you get yourself tested?"],
            ["nl", "Waar heb je jezelf (de laatste keer) laten testen?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q1aNLKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1', '2')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Hospital or general practitioner"],
                ["nl", "Ziekenhuis of huisarts"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "GGD testing facility"],
                ["nl", "GGD teststraat"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "GGD testing facility for health care workers and teachers"],
                ["nl", "GGD teststraat via de prioriteitsregeling voor zorgmedewerkers en leraren"],
            ])
        },
        {
            key: '4', role: 'option',
            content: new Map([
                ["en", "GGD visited my home address"],
                ["nl", "GGD is langs geweest"],
            ])
        },
        {
            key: '5', role: 'option',
            content: new Map([
                ["en", "At a commercial company (own initiative)"],
                ["nl", "Bij een bedrijf (op eigen initiatief)"],
            ])
        },
        {
            key: '6', role: 'option',
            content: new Map([
                ["en", "At a commercial company (via employer)"],
                ["nl", "Bij een bedrijf (via mijn werkgever)"],
            ])
        },
        {
            key: '7', role: 'option',
            content: new Map([
                ["en", "Abroad"],
                ["nl", "In het buitenland"],
            ])
        },
        {
            key: '8', role: 'option',
            content: new Map([
                ["en", "I don't know"],
                ["nl", "Dat weet ik niet meer"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q1hNL_def = (itemSkeleton: SurveyItem, q1aNLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you pay for the test?"],
            ["nl", "Heb je zelf betaald voor de test?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q1aNLKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1', '2')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["nl", "Ja"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q1bNL_def = (itemSkeleton: SurveyItem, q1aNLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "What was your test result?"],
            ["nl", "Wat was de uitslag van de test?"],
            ["fr", " Quel a été votre température mesurée la plus élevée?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q1aNLKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1', '2')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Positive, evidence for infection with coronavirus"],
                ["nl", "Positief, dus WEL besmet (geweest) met het nieuwe coronavirus"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Negative, NO evidence for infection with coronavirus"],
                ["nl", "Negatief, dus GEEN bewijs voor besmetting met het nieuwe coronavirus"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "I prever not to say"],
                ["nl", "Dit wil ik niet aangeven"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}


const q1cNL_def = (itemSkeleton: SurveyItem, q1aNLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "How many days after your first symptoms was the swap/sample taken?"],
            ["nl", "Hoeveel dagen na de eerste klachten ben je getest?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q1aNLKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1')
    )


    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const ddOptions = initDropdownGroup(dropDownKey, [
        {
            key: '0', role: 'option', content: new Map([
                ["en", "Not applicable, I did not have any symptoms"],
                ["nl", "Niet van toepassing, ik had/heb geen symptomen"],
            ]),
        },
        {
            key: '1', role: 'option', content: new Map([
                ["en", "On the same day as the first symptoms"],
                ["nl", "Op dezelfde dag als de eerste klachten"],
            ]),
        },
        {
            key: '2', role: 'option', content: new Map([
                ["en", "1 day"],
                ["nl", "1 dag"],
                ["fr", "1 jour"],
            ]),
        },
        {
            key: '3', role: 'option', content: new Map([
                ["en", "2 days"],
                ["nl", "2 dagen"],
                ["fr", "2 jours"],
            ]),
        },
        {
            key: '4', role: 'option', content: new Map([
                ["en", "3 days"],
                ["nl", "3 dagen"],
                ["fr", "3 jours"],
            ]),
        },
        {
            key: '5', role: 'option', content: new Map([
                ["en", "4 days"],
                ["nl", "4 dagen"],
                ["fr", "4 jours"],
            ]),
        },
        {
            key: '6', role: 'option', content: new Map([
                ["en", "5 days"],
                ["nl", "5 dagen"],
                ["fr", "5 jours"],
            ]),
        },
        {
            key: '7', role: 'option', content: new Map([
                ["en", "6 days"],
                ["nl", "6 dagen"],
                ["fr", "6 jours"],
            ]),
        },
        {
            key: '8', role: 'option', content: new Map([
                ["en", "7 days"],
                ["nl", "7 dagen"],
                ["fr", "7 jours"],
            ]),
        },
        {
            key: '9', role: 'option', content: new Map([
                ["en", "8 days"],
                ["nl", "8 dagen"],
                ["fr", "8 jours"],
            ]),
        },
        {
            key: '10', role: 'option', content: new Map([
                ["en", "9 days"],
                ["nl", "9 dagen"],
                ["fr", "9 jours"],
            ]),
        },
        {
            key: '11', role: 'option', content: new Map([
                ["en", "10 days"],
                ["nl", "10 dagen"],
                ["fr", "10 jours"],
            ]),
        },
        {
            key: '12', role: 'option', content: new Map([
                ["en", "11 days"],
                ["nl", "11 dagen"],
                ["fr", "11 jours"],
            ]),
        },
        {
            key: '13', role: 'option', content: new Map([
                ["en", "12 days"],
                ["nl", "12 dagen"],
                ["fr", "12 jours"],
            ]),
        },
        {
            key: '14', role: 'option', content: new Map([
                ["en", "13 days"],
                ["nl", "13 dagen"],
                ["fr", "13 jours"],
            ]),
        },
        {
            key: '15', role: 'option', content: new Map([
                ["en", "14 days"],
                ["nl", "14 dagen"],
                ["fr", "14 jours"],
            ]),
        },
        {
            key: '16', role: 'option', content: new Map([
                ["en", "More than 14 days"],
                ["nl", "meer dan 14 dagen"],
                ["fr", "Plus de 14 jours"],
            ]),
        },
        {
            key: '17', role: 'option', content: new Map([
                ["en", "I don't know/can't remember"],
                ["nl", "Dat weet ik niet (meer)"],
                ["fr", "Je ne sais pas / je ne m'en souviens plus"],
            ]),
        },

    ]);

    editor.addExistingResponseComponent(ddOptions, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}


const q1dNL_def = (itemSkeleton: SurveyItem, q1aNLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "On which day was the blood taken for the corona test? Please guess if you can't remember the date exactly."],
            ["nl", "Wanneer is de test voor het nieuwe coronavirus bij je gedaan? Als je de datum niet meer precies weet mag je deze schatten. Het gaat om de datum dat je bloed is afgenomen."],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q1aNLKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '2')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'dateInput',
            optionProps: {
                min: { dtype: 'exp', exp: expWithArgs('timestampWithOffset', -2592000) },
                max: { dtype: 'exp', exp: expWithArgs('timestampWithOffset', 10) },
            },
            content: new Map([
                ["en", "Choose date"],
                ["nl", "Kies de dag"],
                ["fr", "Sélectionner la date"],
            ])
        },
        //{
        //    key: '1', role: 'option',
        //    content: new Map([
        //        ["en", "I don't know/can't remember"],
        //        ["de", "Ich weiss es nicht bzw. kann mich nicht erinnern"],
        //       ["nl", "Ik weet het niet (meer)."],
        //        ["fr", "Je ne sais pas / je ne m'en souviens plus"],
        //    ])
        //},
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}


const q1eNL_def = (itemSkeleton: SurveyItem, q1aNLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "In the two weeks before your test were you approached in the context of contact-tracing by the GGD (local public health service)?"],
            ["nl", "Ben je in de twee weken voor je test benaderd door de GGD in verband met contactonderzoek?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q1aNLKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "No, I have not been contacted"],
                ["nl", "Nee, ik ben niet door de GGD benaderd in verband met contactonderzoek"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Yes, I am contacted"],
                ["nl", "Ja, ik ben wel door de GGD benaderd in verband met contactonderzoek"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "I don't want to say"],
                ["nl", "Dit wil ik niet aangeven"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q1fNL_def = (itemSkeleton: SurveyItem, q1aNLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "In the two weeks before your test were you warned by the mobile phone app CoronaMelder?"],
            ["nl", "Ben je in de twee weken voor je test gewaarschuwd door de mobiele telefoon app CoronaMelder?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [q1aNLKey].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No, I don't have the CoronaMelder app installed on my phone"],
                ["nl", "Nee, ik heb de app CoronaMelder niet geïnstalleerd op mijn mobiel."],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "No, I have the app installed, but haven't been warned"],
                ["nl", "Nee, ik heb de app CoronaMelder wel geïnstalleerd op mijn mobiel maar ben niet gewaarschuwd."],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Yes, I have the app installed and have been warned"],
                ["nl", "Ja, ik heb de app CoronaMelder geïnstalleerd op mijn mobiel en ik ben gewaarschuwd."],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "I don't want to say"],
                ["nl", "Dit wil ik niet aangeven"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q10NL_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Did you change your daily routine because of your illness?"],
            ["nl", "Heb je je vanwege je klachten ziek gemeld van werk/school?"],

        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes, but I did not take time off work/school"],
                ["nl", "Nee, maar het had wel effect op mijn dagelijkse praktijk"],

            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Yes, I took time off work/school"],
                ["nl", "Ja"],

            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q10bNL_def = (itemSkeleton: SurveyItem, q10NLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Are you still off work/school?"],
            ["nl", "Ben je nog steeds ziek gemeld van werk/school?"],
            ["fr", "Êtes-vous toujours en arrêt maladie ?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', q10NLKey, [responseGroupKey, singleChoiceKey].join('.'), '2')
    )

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To estimate the average  amount of time that people take off work, we need to know if people are still off work."],
                    ["nl", "Om uit te rekenen hoeveel dagen mensen thuisblijven vanwege klachten."],
                    ["fr", "Afin d'estimer le temps moyen que les gens passent en arrêt de travail."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Tick “yes” if you would be at work/school today if you were not currently ill."],
                    ["nl", "Antwoord 'Ja' als je vanwege klachten vandaag nog thuis zit in plaats van werk/school"],
                    ["fr", "Cochez «oui» si vous vous seriez rendu au travail / à l'école aujourd'hui si vous n'étiez pas actuellement malade."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["nl", "Ja"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["nl", "Nee"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Other (e.g. I wouldn’t usually be at work/school today anyway)"],
                ["nl", "Anders (ik hoefde vandaag sowieso niet naar werk/school)"],
                ["fr", "Autre (p. ex «Je ne me serais de toute façon pas rendu au travail / à l'école aujourd'hui»)"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}

const q10cNL_def = (itemSkeleton: SurveyItem, q10NLKey: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "How long have you been off work/school?"],
            ["nl", "Hoeveel dagen ben je ziek gemeld van werk/school?"],
            ["fr", "Combien de temps avez-vous été absent du travail / de l'école ?"],
        ]))
    );


    editor.setCondition(
        expWithArgs('responseHasKeysAny', q10NLKey, [responseGroupKey, singleChoiceKey].join('.'), '2')
    )

    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["nl", "Waarom vragen we dit?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To measure the effect of symptoms on people’s daily lives."],
                    ["nl", "Om het effect te bepalen van de klachten op je dagelijksleven"],
                    ["fr", "Afin de mesurer l'effet des symptômes sur la vie quotidienne des gens."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["nl", "Hoe zal ik deze vraag beantwoorden?"],
                    ["fr", "Comment devez-vous répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Only count the days that you normally would have been in school or work (e.g. don’t count weekends)."],
                    ["nl", "Tel alleen de dagen waar je normaal naar het werk/school had moeten gaan"],
                    ["fr", "Ne comptez que les jours durant lesquels vous seriez normalement allé à l'école ou au travail (par exemple, ne comptez pas le week-end)."],
                ]),
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "1 day"],
                ["nl", "1 dag"],
                ["fr", "1 jour"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "2 days"],
                ["nl", "2 dagen"],
                ["fr", "2 jours"],
            ])
        }, {
            key: '3', role: 'option',
            content: new Map([
                ["en", "3 days"],
                ["nl", "3 dagen"],
                ["fr", "3 jours"],
            ])
        }, {
            key: '4', role: 'option',
            content: new Map([
                ["en", "4 days"],
                ["nl", "4 dagen"],
                ["fr", "4 jours"],
            ])
        },
        {
            key: '5', role: 'option',
            content: new Map([
                ["en", "5 days"],
                ["nl", "5 dagen"],
                ["fr", "5 jours"],
            ])
        }, {
            key: '6', role: 'option',
            content: new Map([
                ["en", "6 to 10 days"],
                ["nl", "6 tot 10 dagen"],
                ["fr", "6 à 10 jours"],
            ])
        }, {
            key: '7', role: 'option',
            content: new Map([
                ["en", "11 to 15 days"],
                ["nl", "11 tot 15 dagen"],
                ["fr", "11 à 15 jours"],
            ])
        }, {
            key: '8', role: 'option',
            content: new Map([
                ["en", "More than 15 days"],
                ["nl", "Meer dan 15 dagen"],
                ["fr", "Plus de 15 jours"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    editor.addValidation({
        key: 'r1',
        type: 'hard',
        rule: expWithArgs('hasResponse', itemSkeleton.key, responseGroupKey)
    });

    return editor.getItem();
}



// Questions of the Influenzanet questionnaire which are not used in Dutch version
const q8_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, did you contact via TELEPHONE or INTERNET any of medical services?"],
            ["fr", "En raison de vos symptômes, avez-vous contacté un service médical par téléphone ou par Internet?"],
        ]))
    );
    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["fr", "Pourquoi demandons-nous cela?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To find out whether people contact the health services because of their symptoms."],
                    ["fr", "Pour savoir si la population entre en contact avec les services de santé en raison de ses symptômes."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["fr", "Comment dois-je répondre?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Tick all options that apply"],
                    ["fr", "Cochez toutes les options qui s'appliquent"],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
        ])
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '0', role: 'option',
            // disabled: expWithArgs('responseHasOnlyKeysOtherThan', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "No"],
                ["fr", "Non"],
            ])
        },
        {
            key: '1', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "GP - spoke to receptionist only"],
                ["fr", "Médecin généraliste – Echange avec la réceptionniste uniquement"],
            ])
        },
        {
            key: '2', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "GP - spoke to doctor or nurse"],
                ["fr", "Médecin généraliste – Echange avec le médecin ou l'infirmière"],
            ])
        },
        {
            key: '3', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "NHS Direct / NHS 24 / NHS Choices"],
                ["fr", "Service de conseil santé par téléphone (par exemple : compagnie d'assurance)"],
            ])
        },
        {
            key: '4', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "NPFS"],
            ])
        },
        {
            key: '5', role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
            content: new Map([
                ["en", "Other"],
                ["fr", "Autre"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const q8b_def = (itemSkeleton: SurveyItem, q8: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "How soon after your symptoms appeared did you first contact a medical service via TELEPHONE or INTERNET?"],
            ["fr", "Combien de temps après l'apparition de vos symptômes avez-vous contacté un service médical par téléphone ou par Internet?"],
        ]))
    );
    editor.setHelpGroupComponent(
        generateHelpGroupComponent([
            {
                content: new Map([
                    ["en", "Why are we asking this?"],
                    ["fr", "Pourquoi demandons-nous cela ?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "To find out how quickly people with symptoms contact the health services."],
                    ["fr", "Pour savoir à quelle vitesse la population présentant des symptômes entre en contact avec les services de santé."],
                ]),
                style: [{ key: 'variant', value: 'p' }],
            },
            {
                content: new Map([
                    ["en", "How should I answer it?"],
                    ["fr", "Comment dois-je répondre ?"],
                ]),
                style: [{ key: 'variant', value: 'h5' }],
            },
            {
                content: new Map([
                    ["en", "Only record the time until your FIRST contact with the health services."],
                    ["fr", "En saisissant le temps séparant l'apparition de vos symptômes et votre PREMIER contact avec les services de santé."],
                ]),
            },
        ])
    );
    editor.setCondition(expWithArgs('responseHasKeysAny', q8, [responseGroupKey, multipleChoiceKey].join('.'), '1', '2', '3', '5'));

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const ddOptions: ResponseRowCell = {
        key: 'col1', role: 'dropDownGroup', items: [
            {
                key: '0', role: 'option', content: new Map([
                    ["en", "Same day"],
                    ["fr", "Le jour même"],
                ]),
            },
            {
                key: '1', role: 'option', content: new Map([
                    ["en", "1 day"],
                    ["fr", "1 jour"],
                ]),
            },
            {
                key: '2', role: 'option', content: new Map([
                    ["en", "2 days"],
                    ["fr", "2 jours"],
                ]),
            },
            {
                key: '3', role: 'option', content: new Map([
                    ["en", "3 days"],
                    ["fr", "3 jours"],
                ]),
            },
            {
                key: '4', role: 'option', content: new Map([
                    ["en", "4 days"],
                    ["fr", "4 jours"],
                ]),
            },
            {
                key: '5', role: 'option', content: new Map([
                    ["en", "5-7 days"],
                    ["fr", "5-7 jours"],
                ]),
            },
            {
                key: '6', role: 'option', content: new Map([
                    ["en", "More than 7 days"],
                    ["fr", "Plus de 7 jours"],
                ]),
            },
            {
                key: '7', role: 'option', content: new Map([
                    ["en", "I don't know/can't remember"],
                    ["fr", "Je ne sais pas / je ne m'en souviens plus"],
                ]),
            },
        ]
    };

    const rg_inner = initMatrixQuestion(matrixKey, [
        {
            key: 'header', role: 'headerRow', cells: [
                {
                    key: 'col0', role: 'text', content: new Map([
                        ["en", "Medical Service"],
                        ["fr", "Service médical"],
                    ]),
                },
                {
                    key: 'col1', role: 'text'
                },
            ]
        },
        {
            key: 'r1', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "GP - spoke to receptionist only"],
                        ["fr", "Médecin généraliste – Echange avec la réceptionniste uniquement"],
                    ]),
                },
                { ...ddOptions },
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q8].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '1')
        },
        {
            key: 'r2', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "GP – spoke to doctor or nurse"],
                        ["fr", "Médecin généraliste – Echange avec le médecin ou l'infirmière"],
                    ]),
                },
                { ...ddOptions },
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q8].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '2')
        },
        {
            key: 'r3', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "NHS Direct / NHS 24 / NHS Choices"],
                        ["fr", "Service de conseil santé par téléphone (par exemple : compagnie d'assurance)"],
                    ]),
                },
                { ...ddOptions },
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q8].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '3')
        },
        {
            key: 'r4', role: 'responseRow', cells: [
                {
                    key: 'col0', role: 'label', content: new Map([
                        ["en", "Other"],
                        ["fr", "Autre"],
                    ]),
                },
                { ...ddOptions },
            ],
            displayCondition: expWithArgs('responseHasKeysAny', [q8].join('.'), [responseGroupKey, multipleChoiceKey].join('.'), '5')
        },
    ]);

    editor.addExistingResponseComponent(rg_inner, rg?.key);

    return editor.getItem();
}

const q14_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, were you hospitalized?"],
            ["fr", "Avez-vous été hospitalisé à cause des symptômes que vous rapportez aujourd’hui ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "No"],
                ["fr", "Non"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

// COVID questions which are not used in the Dutch version
const qcov4_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, did you call [write the COVID-19 emergency line of your country]?"],
            ["fr", "En raison de vos symptômes, avez-vous contacté par téléphone l'infoline Coronavirus mise en place par le gouvernement ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "I don't know"],
                ["fr", "Je ne sais pas"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov5_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, did you call [write the general emergency line of your country]?"],
            ["fr", "En raison de vos symptômes, avez-vous contacté le 144 par téléphone?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["fr", "Non"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "I don't know"],
                ["fr", "Je ne sais pas"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov6_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, did you wear a mask (surgical mask sold in pharmacies)?"],
            ["fr", "En raison de vos symptômes, avez-vous porté un masque (masque chirurgical en vente en pharmacie, ou masque FFP1, FFP2, FFP3)) ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["fr", "Oui"],
            ])
        }, {
            key: '2', role: 'option',
            content: new Map([
                ["en", "No, I would have liked but could not find any"],
                ["fr", "Non, j’aurais aimé mais je n’ai pas réussi à en trouver"],
            ])
        }, {
            key: '3', role: 'option',
            content: new Map([
                ["en", "No"],
                ["fr", "Non"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov7_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, have you taken or strengthened one or more of the following measures?"],
            ["fr", "En raison de vos symptômes, avez-vous adopté ou renforcé une ou plusieurs des mesure(s) suivante(s) ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    editor.addExistingResponseComponent({
        role: 'text',
        content: generateLocStrings(
            new Map([
                ['en', 'Select all options that apply'],
                ["fr", "sélectionnez toutes les options applicables"],
            ])),
    }, rg?.key);
    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '1',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Regularly wash or disinfect hands"],
                ["fr", "Vous laver ou désinfecter les mains régulièrement"],
            ])
        }, {
            key: '2',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Use a disposable tissue"],
                ["fr", "Utiliser un mouchoir à usage unique"],
            ])
        }, {
            key: '3',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Cough or sneeze into your elbow"],
                ["fr", "Tousser ou éternuer dans votre coude"],
            ])
        }, {
            key: '4',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Wear a disposable mask"],
                ["fr", "Porter un masque jetable"],
            ])
        },
        {
            key: '5',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Avoid shaking hands"],
                ["fr", "Eviter de serrer les mains"],
            ])
        },
        {
            key: '11',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Stop greeting by hugging and/or kissing on both cheeks"],
                ["fr", "Eviter de faire la bise et/ou serrer les gens dans vos bras"],
            ])
        },
        {
            key: '6',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Limit your use of public transport"],
                ["fr", "Limiter votre utilisation des transports en commun"],
            ])
        },
        {
            key: '7',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Avoid gatherings (going to the theater, cinema, stadium, supermarket, etc.)"],
                ["fr", "Eviter les rassemblements (sortie au théâtre, au cinéma, au stade, au supermarché …)"],
            ])
        },
        {
            key: '8',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Stay at home"],
                ["fr", "Rester chez vous"],
            ])
        },
        {
            key: '9',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Telework or increase your number of telework days"],
                ["fr", "Télétravailler ou augmenter votre nombre de jours de télétravail"],
            ])
        },
        {
            key: '10',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Avoid travel outside your own country or region"],
                ["fr", "Eviter de voyager à l'extérieur de votre pays ou région"],
            ])
        },
        {
            key: '13',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Have your food-shopping delivered by a store or a friend/family member"],
                ["fr", "Vous faire livrer vos courses par un magasin ou un ami/membre de la famille"],
            ])
        },
        {
            key: '14',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Avoid seeing friends and family"],
                ["fr", "Eviter de voir vos amis et famille"],
            ])
        }, {
            key: '15',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Avoid being in contact with people over 65 years or with a chronic disease"],
                ["fr", "Eviter le contact avec des personnes de plus de 65 ans ou avec une maladie chronique"],
            ])
        },
        {
            key: '16',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '12'),
            content: new Map([
                ["en", "Avoid being in contact with children"],
                ["fr", "Eviter le contact avec les enfants"],
            ])
        },
        {
            key: '12',
            role: 'option',
            content: new Map([
                ["en", "None of these measures"],
                ["fr", "Aucune de ces mesures"],
            ])
        },

    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}


const qcov9_def = (itemSkeleton: SurveyItem, q11Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "For which reason(s) do you think you have this disease?"],
            ["fr", "Pour quelle(s) raison(s) pensez-vous avoir cette maladie ?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', q11Key, [responseGroupKey, singleChoiceKey].join('.'), '9')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    editor.addExistingResponseComponent({
        role: 'text',
        content: generateLocStrings(
            new Map([
                ['en', 'Select all options that apply'],
                ["fr", "sélectionnez toutes les options applicables"],
            ])),
    }, rg?.key);
    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '1',
            role: 'option',
            content: new Map([
                ["en", "My doctor told me I have this disease"],
                ["fr", "Mon médecin m’a dit qu’il s’agissait de cette maladie "],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "I had a laboratory confirmation that I have this disease"],
                ["fr", "J’ai fait des analyses en laboratoire qui ont confirmé que j’ai cette maladie "],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "I had direct contact with a laboratory confirmed case"],
                ["fr", "J’ai été en contact direct avec un cas confirmé en laboratoire"],
            ])
        },
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "I had close contact with someone for whom a doctor diagnosed this disease"],
                ["fr", "J’ai été en contact étroit avec une personne pour laquelle le médecin a diagnostiqué cette maladie"],
            ])
        },
        {
            key: '5',
            role: 'option',
            content: new Map([
                ["en", "I was in close contact with someone presenting symptoms of this disease"],
                ["fr", "J’ai été en contact étroit avec une personne présentant des symptômes de cette maladie"],
            ])
        },
        {
            key: '6',
            role: 'option',
            content: new Map([
                ["en", "I was at an event/location with a confirmed case"],
                ["fr", "J’ai été dans un lieu ou à un évènement où s’est rendu un cas confirmé "],
            ])
        },
        {
            key: '7',
            role: 'option',
            content: new Map([
                ["en", "I think I have this disease"],
                ["fr", "J’ai l’impression d’avoir cette maladie "],
            ])
        },

    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov9b_def = (itemSkeleton: SurveyItem, q11Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Have you informed people who have been in close contact with you about your suspicion of COVID-19 infection?"],
            ["fr", "Avez-vous informé les personnes avec qui vous avez eu un contact rapproché de votre suspicion de COVID-19 ?"],
        ]))
    );


    editor.setCondition(
        expWithArgs('responseHasKeysAny', q11Key, [responseGroupKey, singleChoiceKey].join('.'), '9')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "Yes"],
                ["fr", "Oui"],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "Some of them"],
                ["fr", "Quelques personnes, pas toutes"],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "No"],
                ["fr", "Non"],
            ])
        },
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov10_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Do you currently carry out a professional activity?"],
            ["fr", "Exercez-vous une activité professionnelle ? "],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    editor.addExistingResponseComponent({
        role: 'text',
        content: generateLocStrings(
            new Map([
                ['en', 'Select all options that apply'],
                ["fr", "sélectionnez toutes les options applicables"],
            ])),
    }, rg?.key);


    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '1',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '3', '4', '5'),
            content: new Map([
                ["en", "Yes, I work from home"],
            ])
        },
        {
            key: '2',
            role: 'option',
            disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '3', '4', '5'),
            content: new Map([
                ["en", "Yes, I work outside from home"],
            ])
        },
        {
            key: '3',
            role: 'option',
            disabled: expWithArgs('responseHasOnlyKeysOtherThan', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '3'),
            content: new Map([
                ["en", "No, I have a leave of absence to take care of my kid(s)"],
            ])
        },
        {
            key: '4',
            role: 'option',
            disabled: expWithArgs('responseHasOnlyKeysOtherThan', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '4'),
            content: new Map([
                ["en", "No, I have a sick leave (because of Covid-19)"],
            ])
        },
        {
            key: '5',
            role: 'option',
            disabled: expWithArgs('responseHasOnlyKeysOtherThan', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '5'),
            content: new Map([
                ["en", "No, I have another situation (retired, job-seeker, student, house-wife/husband, other sick-leave, partial unemployment, forced leave…)"],
            ])
        }
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov11_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Over recent days, at which frequency did you go out of home to buy products, on average?"],
            ["fr", "Durant ces derniers jours, à quelle fréquence êtes-vous sorti de la maison pour acheter des produits, en moyenne ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1',
            role: 'option',
            content: new Map([
                ["en", "I do not go out of home anymore"],
                ["fr", "Je ne sors plus de la maison"],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "Less than once a week"],
                ["fr", "Moins d'une fois par semaine"],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "Once a week"],
                ["fr", "Une fois par semaine"],
            ])
        },
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "2 to 6 times a week"],
                ["fr", "2 à 6 fois par semaine"],
            ])
        },
        {
            key: '5',
            role: 'option',
            content: new Map([
                ["en", "Once a day"],
                ["fr", "Une fois par jour"],
            ])
        },
        {
            key: '6',
            role: 'option',
            content: new Map([
                ["en", "Several times per day"],
                ["fr", "Plusieurs fois par jour"],
            ])
        }
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov12_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Over recent days, at which frequency did you go out of home to get fresh air or exercise (outside your home, balcony, garden, private courtyard), on average?"],
            ["fr", "Durant ces derniers jours, à quelle fréquence êtes vous sorti, en moyenne, pour prendre l'air ou faire de l'exercice (en dehors de votre maison, balcon, jardin ou terrain privé) ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1',
            role: 'option',
            content: new Map([
                ["en", "I do not go out of home anymore"],
                ["fr", "Je ne sors plus de la maison"],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "Less than once a week"],
                ["fr", "Moins d'une fois par semaine"],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "Once a week"],
                ["fr", "Une fois par semaine"],
            ])
        },
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "2 to 6 times a week"],
                ["fr", "2 à 6 fois par semaine"],
            ])
        },
        {
            key: '5',
            role: 'option',
            content: new Map([
                ["en", "Once a day"],
                ["fr", "Une fois par jour"],
            ])
        },
        {
            key: '6',
            role: 'option',
            content: new Map([
                ["en", "Several times per day"],
                ["fr", "Plusieurs fois par jour"],
            ])
        }
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov13_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Over the course of yesterday, how many people (outside your household) did you approach at a distance lower than 1 meter?"],
            ["fr", "Durant la journée d'hier, avec combien de personnes (en dehors de votre foyer) avez vous été en contact à moins d'un mètre ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "0"],
                ["fr", "0"],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "1"],
                ["fr", "1"],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "2 to 5"],
                ["fr", "2 à 5"],
            ])
        },
        {
            key: '1',
            role: 'option',
            content: new Map([
                ["en", "6 to 10"],
                ["fr", "6 à 10"],
            ])
        },
        {
            key: '99',
            role: 'option',
            content: new Map([
                ["en", "More than 10"],
                ["fr", "Plus de 10"],
            ])
        }
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov14_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "If lockdown measures were lifted up, but collective childcare / schools / university were closed, what would be your situation?"],
            ["fr", "Si les mesures de confinement étaient levées, mais les garderies / crèches / écoles/universités étaient fermées, quelle serait votre situation ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });

    editor.addExistingResponseComponent({
        role: 'text',
        content: generateLocStrings(
            new Map([
                ['en', 'Select all options that apply'],
                ["fr", "sélectionnez toutes les options applicables"],
            ])),
    }, rg?.key);

    const rg_inner = initMultipleChoiceGroup(multipleChoiceKey, [
        {
            key: '1',
            role: 'option',
            content: new Map([
                ["en", "I would work from home"],
                ["fr", "Je travaillerais depuis mon domicile"],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "I would work outside from home"],
                ["fr", "Je travaillerais hors de mon domicile"],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "I would have a leave of absence to take care of my kid(s)"],
                ["fr", "Je serais en congé pour pouvoir m'occuper de mes enfants"],
            ])
        },
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "I would have a sick leave (because of Covid-19)"],
                ["fr", "Je serais en congé-maladie (en raison du COVID-19)"],
            ])
        },
        {
            key: '5',
            role: 'option',
            content: new Map([
                ["en", "I would be in another situation (retired, job-seeker, student, house-wife/husband, other sick-leave, partial unemployment, forced leave…)"],
                ["fr", "Je serais dans une autre situation (retraité, au chômage, étudiant, femme/homme au foyer, congé-maladie pour une autre raison, au chomâge partiel, ...)"],
            ])
        },
        {
            key: '6',
            role: 'option',
            content: new Map([
                ["en", "I don’t know"],
                ["fr", "Je ne sais pas"],
            ])
        }
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov14b_def = (itemSkeleton: SurveyItem, qcov14Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "How many days a week would you work outside from home?"],
            ["fr", "Combien de jours par semaine travailleriez-vous hors de votre domicile ?"],
        ]))
    );


    editor.setCondition(
        expWithArgs('responseHasKeysAny', qcov14Key, [responseGroupKey, multipleChoiceKey].join('.'), '2')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSliderCategoricalGroup(sliderCategoricalKey, [
        {
            key: '0',
            role: 'option',
            content: new Map([
                ["en", "0"],
                ["fr", "0"],
            ])
        },
        {
            key: '1',
            role: 'option',
            content: new Map([
                ["en", "1"],
                ["fr", "1"],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "2"],
                ["fr", "2"],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "3"],
                ["fr", "3"],
            ])
        },
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "4"],
                ["fr", "4"],
            ])
        },
        {
            key: '5',
            role: 'option',
            content: new Map([
                ["en", "5"],
                ["fr", "5"],
            ])
        },
        {
            key: '6',
            role: 'option',
            content: new Map([
                ["en", "6"],
                ["fr", "6"],
            ])
        },
        {
            key: '7',
            role: 'option',
            content: new Map([
                ["en", "7"],
                ["fr", "7"],
            ])
        }
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov15_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "If lockdown measures were extended (that is to say, continued beyond the date announced by the government), do you think you would follow the recommendations with as much rigour as you do now?"],
            ["fr", "Si les mesures de confinement étaient prolongées (c'est-à-dire au-delà de la date annoncée par le gouvernement), pensez-vous que vous suivriez les recommandations avec autant de rigueur qu'actuellement ?"],
        ]))
    );

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '4',
            role: 'option',
            content: new Map([
                ["en", "Yes, absolutely"],
                ["fr", "Oui, absolument"],
            ])
        },
        {
            key: '3',
            role: 'option',
            content: new Map([
                ["en", "Yes, moderately"],
                ["fr", "Oui, plus ou moins"],
            ])
        },
        {
            key: '2',
            role: 'option',
            content: new Map([
                ["en", "No, not really"],
                ["fr", "Non, pas vraiment"],
            ])
        },
        {
            key: '1',
            role: 'option',
            content: new Map([
                ["en", "No, not at all"],
                ["fr", "Non, pas du tout"],
            ])
        },
        {
            key: '99',
            role: 'option',
            content: new Map([
                ["en", "I don't know"],
                ["fr", "Je ne sais pas"],
            ])
        }
    ])
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov16_def = (itemSkeleton: SurveyItem): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Because of your symptoms, did you undergo analyses to know if you have COVID-19 (infection due to SRAS-CoV-2)?"],
            ["fr", "En raison de vos symptômes, avez-vous effectué des analyses pour savoir si vous aviez le COVID-19 (infection due au nouveau coronavirus SARS-CoV-2) ?"],
        ]))
    );


    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes, a PCR test (virus search, on a swab in nose or mouth, or a sputum or saliva sample)"],
                ["fr", "Oui, un test PCR (recherche du virus à partir d’un frottis dans le nez ou dans la bouche, ou d’un prélèvement de crachat ou de salive)"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Yes, a serological analysis (screening for antibodies against this virus, from a drop of blood at fingertip or a blood sample)"],
                ["fr", "Oui, une sérologie (recherche d’anticorps contre le virus à partir d’une goutte de sang au bout du doigt ou d’une prise de sang)"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "Not yet, I have a prescription and plan to shortly undergo a test"],
                ["fr", "Pas encore, j'ai une prescription et prévois de réaliser un test prochainement"],
            ])
        },
        {
            key: '4', role: 'option',
            content: new Map([
                ["en", "No, I have a prescription but will not undergo the test"],
                ["fr", "Non, j'ai une prescription mais ne prévois pas de réaliser de test"],
            ])
        },
        {
            key: '0', role: 'option',
            content: new Map([
                ["en", "No"],
                ["fr", "Non"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);

    return editor.getItem();
}

const qcov16b_def = (itemSkeleton: SurveyItem, qcov16Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Do you already get the result of this PCR test?"],
            ["fr", "Avez-vous déjà reçu le résultat de cette analyse par PCR ?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [qcov16Key].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '1')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes, Positive for this new coronavirus (SARS-CoV-2, COVID-19)"],
                ["fr", "Oui, positif pour le coronavirus SARS-CoV-2 (COVID-19)"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Yes, Negative for this new coronavirus (SARS-CoV-2, COVID-19)"],
                ["fr", "Oui, négatif pour le coronavirus SARS-CoV-2 (COVID-19)"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "Yes, the result is non interpretable"],
                ["fr", "Oui, le résultat est non interprétable"],
            ])
        },
        {
            key: '4', role: 'option',
            content: new Map([
                ["en", "No, I do not have the result yet"],
                ["fr", "Non, je n'ai pas encore le résultat"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}

const qcov16c_def = (itemSkeleton: SurveyItem, qcov16Key: string): SurveyItem => {
    const editor = new ItemEditor(itemSkeleton);
    editor.setTitleComponent(
        generateTitleComponent(new Map([
            ["en", "Do you already get the result of this serological analysis?"],
            ["fr", "Avez-vous déjà reçu le résultat de cette analyse de sang ?"],
        ]))
    );

    editor.setCondition(
        expWithArgs('responseHasKeysAny', [qcov16Key].join('.'), [responseGroupKey, singleChoiceKey].join('.'), '2')
    )

    const rg = editor.addNewResponseComponent({ role: 'responseGroup' });
    const rg_inner = initSingleChoiceGroup(singleChoiceKey, [
        {
            key: '1', role: 'option',
            content: new Map([
                ["en", "Yes, Positive for this new coronavirus (SARS-CoV-2, COVID-19)"],
                ["fr", "Oui, positif pour le coronavirus SARS-CoV-2 (COVID-19)"],
            ])
        },
        {
            key: '2', role: 'option',
            content: new Map([
                ["en", "Yes, Negative for this new coronavirus (SARS-CoV-2, COVID-19)"],
                ["fr", "Oui, négatif pour le coronavirus SARS-CoV-2 (COVID-19)"],
            ])
        },
        {
            key: '3', role: 'option',
            content: new Map([
                ["en", "Yes, the result is non interpretable"],
                ["fr", "Oui, le résultat est non interprétable"],
            ])
        },
        {
            key: '4', role: 'option',
            content: new Map([
                ["en", "No, I do not have the result yet"],
                ["fr", "Non, je n'ai pas encore le résultat"],
            ])
        },
    ]);
    editor.addExistingResponseComponent(rg_inner, rg?.key);
    return editor.getItem();
}


//{
  //  key: '19', role: 'option',
   //disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
    //content: new Map([
    //    ["en", "Nose bleed"],
      //  ["de", "Nasenbluten"],
       // ["nl", "Bloedneus"],
   // ])
//},

//{
  //  key: '21', role: 'option',
   // disabled: expWithArgs('responseHasKeysAny', editor.getItem().key, responseGroupKey + '.' + multipleChoiceKey, '0'),
    //content: new Map([
     //   ["en", "Loss of taste"],
      //  ["de", "Geschmacksverlust"],
       // ["nl", "Verlies van smaakvermogen"],
    //])
//},
