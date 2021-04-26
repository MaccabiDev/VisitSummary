var getDiagnosis = (json)=>{
    var bulletsArray = [];
    var diagnosisHtml ='';
    if(hasDiagnosis(json)){
        diagnosisHtml = `<div style="padding-top:5px; padding-right:5px; padding-bottom:5px; font-weight:bold;  color:rgb(41, 83, 182); background-color:rgb(248, 241, 241); direction:rtl">אבחנות:</div><ul style="font-size:medium">`
        bulletsArray = json.diagnosis.map(element => {
            return `<li>${element.name}${element.charac_1 !=""?", "+element.charac_1:""}${element.charac_2!=""?", "+element.charac_2:""}${element.remark !=""?", "+element.remark:""}</li>`
        });
        diagnosisHtml=diagnosisHtml.concat(bulletsArray.toString().replace(/,<li>/g,'<li>'),`</ul>`);
    }
    return diagnosisHtml;
}

var hasDiagnosis =(json)=>{
    if(json.diagnosis != null && json.diagnosis.length >0){
        return true;
    }
}

var getDrugs = (json)=>{
    var bulletsArray = [];
    drugsHtml = '';
    if(hasDrugs(json)){
        drugsHtml = `<div style="padding-top:5px; padding-right:5px; padding-bottom:5px;  font-weight:bold; color:rgb(41, 83, 182); background-color:rgb(248, 241, 241); direction:rtl">תרופות:</div><ul style="font-size:medium">`

        bulletsArray = json.drugs.map(element => {
            return `<li>${element.name} - ${element.dosage} ${element.present} x ${element.times !==""? element.times +" per day":""}  ${element.days!==""?" - "+element.days + " days":""} </li>`
        });
        drugsHtml= drugsHtml.concat(bulletsArray.toString().replace(/,<li>/g,'<li>'),'</ul>');
    }
    return drugsHtml;
}

var hasDrugs =(json)=>{
    if(json.drugs != null && json.drugs.length >0){
        return true;
    }
}


var getForms = (json)=>{
    var bulletsArray = [];
    var formsHtml='';
    if(hasForms(json)){
        formsHtml=`<div style="padding-top:5px; padding-right:5px; padding-bottom:5px; font-weight:bold; color:rgb(41, 83, 182); background-color:rgb(248, 241, 241); direction:rtl">הפניות ואישורים:</div>
        <ul style="font-size:medium; direction:rtl">`

        bulletsArray = json.forms.map(element => {
            return `<li>${element.form_name}</li>`
        });
        formsHtml=formsHtml.concat(bulletsArray.toString().replace(/,<li>/g,'<li>'),'</ul>');
    }
    return formsHtml;
}

var hasForms =(json)=>{
    if(json.forms != null && json.forms.length >0){
        return true;
    }
}

var getTreatments = (json)=>{
    var bulletsArray = [];
    var treatmentsHtml = '';
    if(hasTreatments(json)){
        treatmentsHtml = `<div style="padding-top:5px; padding-right:5px; padding-bottom:5px; font-weight:bold; color:rgb(41, 83, 182); background-color:rgb(248, 241, 241); direction:rtl">טיפול:</div>
        <ul style="font-size:medium">`;

        bulletsArray = json.treatments.map(element => {
            return `<li>${element.name}</li>`
        });
        treatmentsHtml= treatmentsHtml.concat(bulletsArray.toString().replace(/,<li>/g,'<li>'),'</ul>');
    }
    
    return treatmentsHtml;
}
var hasTreatments =(json)=>{
    if(json.treatments != null && json.treatments.length >0){
        return true;
    }
}

var getReferralReason = (json)=>{
    if (json.referral_reason){
        return `<div style="padding-top:5px; padding-right:5px; padding-bottom:5px;  font-weight:bold;color:rgb(41, 83, 182); background-color:rgb(248, 241, 241); direction:rtl">המלצות למטופל:</div>
        <div style="font-size:medium; direction:rtl; padding:20px">${json.referral_reason}</div>`;
    }
    else return '';
}



var getPhoneNumber = (json)=>{
    if (json.clinic_phone){
        return `<div>מספר טלפון: ${json.clinic_phone}</div>`;
    }
    else return '';
}

var getGender = (json)=>{
    if (json.gender){
        return `<div>מין: ${json.gender}</div>`;
    }
    else return '';
}

var getPhone = (json)=>{
    if (json.phone){
        return `<div>טלפון: ${json.phone}</div>`;
    }
    else return '';
}
var getMobile = (json)=>{
    if (json.mobile){
        return `<div>טלפון נוסף: ${json.mobile}</div>`;
    }
    else return '';
}
var getAdress = (json)=>{
    if (json.address){
        return `<div>כתובת: ${json.address}</div>`;
    }
    else return '';
}
var getPostal = (json)=>{
    if (json.postal){
        return `<div>מיקוד: ${json.postal}</div>`;
    }
    else return '';
}


module.exports.createHtml= function(json){
    return `
    <html>
        <head>
            <title>כותרת הדף</title>
            <link rel="stylesheet" href="css/style.css">
        </head>
        <body style="font-family:arial;  margin:auto;">
            <div style="width:90%; margin:auto">
                <div style="direction:rtl; font-size:large; margin-bottom:25px;">
                    <div style="font-weight:bold;">${json.operator_name}, ${json.specialization}</div>
                    <div>${json.clinic_name}</div>
                    ${getPhoneNumber(json)}
                </div>

                <div style="text-align:center; font-size:large; color:rgb(41, 83, 182); margin-bottom:25px;" >
                    <div >סיכום ביקור מספר: ${json.visit_number}</div>
                    <div style="font-weight:bold;">תאריך ביקור: ${json.visit_date}</div>                
                </div>

                <div style="text-align:center; position:relative; font-size:small; margin-bottom:35px; ">
                    <p  style="background-color:white; position:absolute; padding:5px; top:-30px; right:-10px;">פרטי המטופל</p>
                    <table align="center" style="direction:rtl; width:100%; padding:20px; border:1px solid rgb(41, 83, 182);">
                        <tr>
                            <td><div>שם משפחה: <span style="font-weight:bold;">${json.last_name}</span></div></td>
                            <td></td>
                            <td><div>שם פרטי: <span style="font-weight:bold;">${json.first_name}</span></div></td>
                            <td><div>ת.ז: <span style="font-weight:bold;">${json.patient_id}</span></div></td>
                        </tr>
                        <tr>
                            
                            <td><div>ת. לידה: ${json.birth_date}</div></td>
                            <td>${getGender(json)}</td>
                            <td>${getPhone(json)}</td>
                            <td>${getMobile(json)}</td>
                        </tr>
                        <tr>
                            
                            <td>${getAdress(json)}</td>
                            <td></td>
                            <td></td>
                            <td>${getPostal(json)}</td>
                        </tr>
                    </table>
                </div>

                <div style="font-size:large">
                    
                    ${getDiagnosis(json)}

                    ${getReferralReason(json)}
                    
                    ${getTreatments(json)}
                    
                    ${getForms(json)}
                    
                    ${getDrugs(json)}
                    
                </div>
            </div>
            <div style="display:none">
                <img  src="images/Maccabi.PNG">
                <img style="width:100%" src="images/Maccabi_footer.PNG">
            </div>

        </body>
    </html>
    `
};