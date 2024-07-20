const warrantyYears = {};
const applianceMinPrices = [300,400,900];

const provinces = {
    'Ontario': 'ON',
    'Saskatchewan': 'SK',
    'British Columbia': 'BC',
    'Alberta': 'AB',
    'Northwest Territories': 'NT',
    'Manitoba': 'MB',
    'Newfoundland': 'NL',
    'Nova Scotia': 'NS',
    'New Brunswick': 'NB',
    'Prince Edward Island': 'PE',
    'Nunavut': 'NU',
    'Yukon': 'YT',
    'Quebec': 'QC',
};

var phoneCursorPos = 2;
var postalCursorPos = 0;

var dateCursorPos = 14;

const typeMenuOptions = '<option value="noProduct">NONE</option>'
+ '<option value="appliances">Appliances</option>'
+ '<option value="computers">Computers & Accessories</option>'
+ '<option value="televisions">Televisions</option>'
+ '<option value="other electronics">Other Electronics</option>';

function getWarrantyPrice(selection, numCombo, numYears, price, idNumber) {
    var warrantyPrice;
    var warrantyCode;
    if (selection == 'appliances') {
        for (const x in warrantyDict[selection][numYears][numCombo]) {
            if (price < warrantyDict[selection][numYears][numCombo][x]['maxPrice']) {
                warrantyPrice = warrantyDict[selection][numYears][numCombo][x]['warrantyPrice'];
                warrantyCode = x;
                break;
            }
        }
    } else {
        for (const x in warrantyDict[selection][numYears]) {
            if (price < warrantyDict[selection][numYears][x]['maxPrice']) {
                warrantyPrice = warrantyDict[selection][numYears][x]['warrantyPrice'];
                warrantyCode = x;
                break;
            }
        }
    }

    const priceName = 'warrantyPrice' + idNumber;
    const codeName = 'warrantyCode' + idNumber;
    const lengthName = 'warrantyLength' + idNumber;

    document.getElementById(priceName).value = warrantyPrice;
    document.getElementById(codeName).value = warrantyCode;
    document.getElementById(lengthName).value = (selection == 'replacement' ? '' : '+') + numYears;
}

function calculatePrices() {
    const applianceWarrantyGroups = {};
    const numTables = document.getElementsByTagName("table").length;
    for (let i = 1; i <= numTables; i++) {
        const selection = document.getElementById("productMenu" + i).options[document.getElementById("productMenu" + i).selectedIndex].value;
        const priceFieldName = "price" + i;
        const yearDivName = "lengthDiv" + i;
        const yearMenuName = "lengthMenu" + i;
        const currentPrice = document.getElementById(priceFieldName).value ? Number(parseFloat(document.getElementById(priceFieldName).value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)) : 0;
        if (selection != 'noProduct') {
            if (currentPrice == "") {
                document.getElementById(yearDivName).style.display = "none";
            } else if (currentPrice < 300) {
                document.getElementById(yearDivName).style.display = "none";
                getWarrantyPrice("replacement",null,'2',currentPrice,i);
            } else {
                if (document.getElementById(yearDivName).style.display == "none") {
                    var yearOptions = "";
                    for (const year in warrantyYears[selection]) {
                        yearOptions += "<option value='" + warrantyYears[selection][year] + (year == 0 ? "' selected>" : "'>") + warrantyYears[selection][year] + "</option>";
                    }
                    document.getElementById(yearMenuName).innerHTML = yearOptions;
                    document.getElementById(yearDivName).style.display = "inline-flex";
                }
                const numYears = document.getElementById(yearMenuName).value;
                if (selection != "appliances") {
                    getWarrantyPrice(selection,null,numYears,currentPrice,i);
                }
            }
        }
        if (selection == 'appliances') {
            if (document.getElementById(yearMenuName).value) {
                if (!(applianceWarrantyGroups[document.getElementById(yearMenuName).value])) {
                    applianceWarrantyGroups[document.getElementById(yearMenuName).value] = {};
                }
                if (currentPrice >= 300) {
                    applianceWarrantyGroups[document.getElementById(yearMenuName).value][i] = currentPrice;
                } else {
                    delete applianceWarrantyGroups[document.getElementById(yearMenuName).value][i];
                    if (Object.keys(applianceWarrantyGroups[document.getElementById(yearMenuName).value]).length == 0) {
                        delete applianceWarrantyGroups[document.getElementById(yearMenuName).value];
                    }
                }
            }
        }
    }
    for (const yearCat in applianceWarrantyGroups) {
        let yearCatPrice = 0;
        for (const idNumber in applianceWarrantyGroups[yearCat]) {
            yearCatPrice += applianceWarrantyGroups[yearCat][idNumber];
        }
        for (const idNumber in applianceWarrantyGroups[yearCat]) {
            let numAppliances = Object.keys(applianceWarrantyGroups[yearCat]).length > 3 ? 3 : Object.keys(applianceWarrantyGroups[yearCat]).length;
            getWarrantyPrice('appliances',numAppliances,yearCat,yearCatPrice,idNumber);
        }
    }
}

function replaceNewElements(tableToChange, elemType, elemAttribute, noteNumber, replaceString) {
	let elements = tableToChange.getElementsByTagName(elemType);
	let attributeString = elements[noteNumber].getAttribute(elemAttribute);
	let numberGiven = parseInt(attributeString.replace(replaceString, "")) + 3;
	let finalString = replaceString + numberGiven;
	elements[noteNumber].setAttribute(elemAttribute, finalString);
}

function chooseProductType() {
    const idNumber = event.target.id.replace("productMenu","");
    const yearDivName = "lengthDiv" + idNumber;
    const yearMenuName = "lengthMenu" + idNumber;
    const reqFieldName = "reqFieldIfSelected" + idNumber;
    const specOrderName = "specOrderDiv" + idNumber;
    const specOrderCheckName = "specOrderCheck" + idNumber;
    const reqFields = document.getElementsByClassName(reqFieldName);
    if (event.target.options[event.target.selectedIndex].value == 'noProduct') {
        for (let i = 0; i < reqFields.length; i++) {
            reqFields[i].style.backgroundColor = "white";
            reqFields[i].value = "";
            reqFields[i].disabled = true;
        }
        const priceName = 'warrantyPrice' + idNumber;
        const codeName = 'warrantyCode' + idNumber;
        const lengthName = 'warrantyLength' + idNumber;
        document.getElementById(priceName).value = "";
        document.getElementById(codeName).value = "";
        document.getElementById(lengthName).value = "";
        document.getElementById(specOrderName).style.display = "none";
        document.getElementById(yearDivName).style.display = "none";
        document.getElementById(specOrderCheckName).checked = false;
    } else {
        for (let i = 0; i < reqFields.length; i++) {
            if (reqFields[i].value.trim().length > 0) {
                reqFields[i].style.backgroundColor = "white";
            } else {
                reqFields[i].style.backgroundColor = "pink";
            }
            reqFields[i].disabled = false;
        }
        document.getElementById(yearDivName).style.display = "none";
        document.getElementById(specOrderName).style.display = "inline-flex";
    }
    calculatePrices();
}

function checkFieldEmpty() {
    const typeMenuName = "productMenu" + event.target.getAttribute("class").replace("reqFieldIfSelected","").replace(" priceField","");
    const typeMenu = document.getElementById(typeMenuName);
    if (typeMenu.options[typeMenu.selectedIndex].value != 'noProduct') {
        if (event.target.value.trim().length > 0) {
            event.target.style.backgroundColor = "white";
        } else {
            event.target.style.backgroundColor = "pink";
        }
    }
}

function changeProvince() {
    document.getElementById('province').value = event.target.options[event.target.selectedIndex].value;
    document.getElementById('province').style.backgroundColor = 'white';
}

function checkRequiredEmpty() {
    if (event.target.value.trim().length > 0) {
        event.target.style.backgroundColor = "white";
    } else {
        event.target.style.backgroundColor = "pink";
    }
}

function priceKeyPressed() {
    if ((event.key == ' ' || !(isFinite(event.key))) && event.key != '.' && event.keyCode != 8 && event.keyCode != 46 && event.keyCode != 9) {
        event.preventDefault();
    }
}

function priceEntered() {
    if (event.target.value.trim().length > 0) {
        calculatePrices();
    } else {
        const idNumber = event.target.id.replace("price","");
        const priceName = 'warrantyPrice' + idNumber;
        const codeName = 'warrantyCode' + idNumber;
        const lengthName = 'warrantyLength' + idNumber;
        document.getElementById(priceName).value = "";
        document.getElementById(codeName).value = "";
        document.getElementById(lengthName).value = "";
    }
}

function enterDate() {
    if (event.keyCode != 9) {
        event.preventDefault();
    }
    var currentDate = document.getElementById("warrantyDate").value;
    if (event.keyCode == 46) {
        document.getElementById("warrantyDate").value = " /  / ";
        dateCursorPos = 0;
        document.getElementById("warrantyDate").style.backgroundColor = "pink";
    } else if (event.keyCode == 8 && currentDate.length > 6) {
        if (dateCursorPos == 5 || dateCursorPos == 10) {
            dateCursorPos -= 3;
        }
        dateCursorPos -= 1;
        currentDate = currentDate.slice(0, dateCursorPos) + currentDate.slice(dateCursorPos + 1);
        document.getElementById("warrantyDate").value = currentDate;
        if (currentDate.length == 12 || currentDate.length == 14) {
            document.getElementById("warrantyDate").style.backgroundColor = "white";
        } else {
            document.getElementById("warrantyDate").style.backgroundColor = "pink";
        }
    } else if ((isFinite(event.key) && event.key != " ") && currentDate.length < 14) {
        currentDate = currentDate.slice(0, dateCursorPos) + event.key + currentDate.slice(dateCursorPos);
        document.getElementById("warrantyDate").value = currentDate;
        dateCursorPos += 1;
        if (dateCursorPos == 2 || dateCursorPos == 7) {
            dateCursorPos += 3;
        }
        if (currentDate.length == 12 || currentDate.length == 14) {
            document.getElementById("warrantyDate").style.backgroundColor = "white";
        } else {
            document.getElementById("warrantyDate").style.backgroundColor = "pink";
        }
    }
}

function changeHeader() {
    document.querySelectorAll(".pageHeaderName").forEach(e => e.innerHTML = event.target.value);
}

function enterPhone() {
    if (event.keyCode != 9) {
        event.preventDefault();
    }
    var currentPhone = document.getElementById("customerPhone").value;
    if (event.keyCode == 46) {
        document.getElementById("customerPhone").value = "(  )  -  ";
        phoneCursorPos = 2;
        document.getElementById("customerPhone").style.backgroundColor = "pink";
    } else if (event.keyCode == 8 && currentPhone.length > 9) {
        if (phoneCursorPos == 8 || phoneCursorPos == 14) {
            phoneCursorPos -= 3;
        }
        phoneCursorPos -= 1;
        currentPhone = currentPhone.slice(0, phoneCursorPos) + currentPhone.slice(phoneCursorPos + 1);
        document.getElementById("customerPhone").value = currentPhone;
        if (currentPhone.length < 19) {
            document.getElementById("customerPhone").style.backgroundColor = "pink";
        }
    } else if ((isFinite(event.key) && event.key != " ") && currentPhone.length < 19) {
        currentPhone = currentPhone.slice(0, phoneCursorPos) + event.key + currentPhone.slice(phoneCursorPos);
        document.getElementById("customerPhone").value = currentPhone;
        phoneCursorPos += 1;
        if (phoneCursorPos == 5 || phoneCursorPos == 11) {
            phoneCursorPos += 3;
        }
        if (currentPhone.length == 19) {
            document.getElementById("customerPhone").style.backgroundColor = "white";
        }
    }
}

function enterPostal() {
    if (event.keyCode != 9) {
        event.preventDefault();
    }
    var currentPostal = document.getElementById("postalCode").value;
    if (event.keyCode == 46) {
        document.getElementById("postalCode").value = " ";
        postalCursorPos = 0;
        document.getElementById("postalCode").style.backgroundColor = "pink";
    } else if (event.keyCode == 8) {
        if (postalCursorPos > 0) {
        if (postalCursorPos == 4) {
            postalCursorPos -= 1;
        }
        postalCursorPos -= 1;
        currentPostal = currentPostal.slice(0, postalCursorPos) + currentPostal.slice(postalCursorPos + 1);
        document.getElementById("postalCode").value = currentPostal;
        if (currentPostal.length < 7) {
            document.getElementById("postalCode").style.backgroundColor = "pink";
        }
        }
    } else if (currentPostal.length < 7) {
        
        if (((postalCursorPos == 1 || postalCursorPos == 4 || postalCursorPos == 6) && (isFinite(event.key) && event.key != " ")) || ((postalCursorPos == 0 || postalCursorPos == 2 || postalCursorPos == 5) && /[a-zA-Z]/.test(event.key) && event.key.length == 1)) {
            currentPostal = currentPostal.slice(0, postalCursorPos) + event.key.toUpperCase() + currentPostal.slice(postalCursorPos);
            document.getElementById("postalCode").value = currentPostal;
            postalCursorPos += 1;
            if (postalCursorPos == 3) {
                postalCursorPos += 1;
            }
            if (currentPostal.length == 7) {
                document.getElementById("postalCode").style.backgroundColor = "white";
            }  
        }                      
    }
}

function checkSpecOrder() {
    currentSerial = "serialNo" + event.target.id.replace("specOrderCheck","");
    if (event.target.checked) {
        document.getElementById(currentSerial).value = "***SPECIAL ORDER***";
        // document.getElementById(currentSerial).disabled = true;
        // document.getElementById(currentSerial).style.backgroundColor = 'white';
    } else {
        document.getElementById(currentSerial).value = "";
        // document.getElementById(currentSerial).disabled = false;
        // document.getElementById(currentSerial).style.backgroundColor = 'pink';
    }
}

function addPage() {
    const numTables = document.getElementsByTagName("table").length;
    const pageBreak = document.createElement("div");
    pageBreak.setAttribute("class", "pageBreak");
    pageBreak.setAttribute("id", "pageBreak" + (numTables / 3 + 1));
    document.getElementsByTagName("form")[0].appendChild(pageBreak);
    const header = document.createElement("div");
    header.setAttribute("class", "pageHeader noScreen")
    header.setAttribute("id", "pageHeader" + (numTables / 3 + 1));
    const nameHeader = document.createElement("div");
    nameHeader.setAttribute("class", "pageHeaderName noScreen")
    nameHeader.innerHTML = document.getElementById("customerName").value;
    header.appendChild(nameHeader);
    const pageHeader = document.createElement("div");
    pageHeader.setAttribute("class", "pageHeaderNumber noScreen")
    pageHeader.innerHTML = "Page " + (numTables / 3 + 1);
    header.appendChild(pageHeader);
    document.getElementsByTagName("form")[0].appendChild(header);

    for (let i = numTables + 1; i <= numTables + 3; i++) {
        document.getElementsByTagName("form")[0].appendChild(document.createElement("br"));
        document.getElementsByTagName("form")[0].appendChild(document.createElement("br"));
        const newTable = document.createElement("table");
        newTable.innerHTML = makeTable(i);
        document.getElementsByTagName("form")[0].appendChild(newTable);
    }
    document.getElementById("removePageButton").style.display = "inline-block";

}

function removePage() {
    const tables = document.getElementsByTagName("table");
    const numTables = tables.length;
    if (numTables == 6) {
        document.getElementById("removePageButton").style.display = "none";
    }
    for (let j = numTables - 1; j >= numTables - 3; j--) {
        tables[j].remove();
        document.getElementsByTagName("br")[document.getElementsByTagName("br").length - 1].remove();
        document.getElementsByTagName("br")[document.getElementsByTagName("br").length - 1].remove();
    }
    document.getElementById("pageBreak" + (numTables / 3)).remove();
    document.getElementById("pageHeader" + (numTables / 3)).remove();
    calculatePrices();
}

document.addEventListener('DOMContentLoaded', function () {

    for (const category in warrantyDict) {
        if (category != 'apple' && category != 'replacement') {
            warrantyYears[category] = [];
            for (const yearNum in warrantyDict[category]) {
                warrantyYears[category].push(yearNum);
            }
            warrantyYears[category].sort((a, b) => {return parseInt(b) - parseInt(a)});
        }
    }

    today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //As January is 0.
    var yy = today.getFullYear();

    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    const todaysDate = mm + ' / ' + dd + ' / ' + yy;
    document.getElementById('warrantyDate').value = todaysDate;

    var provMenuOptions = '<option disabled selected>--Select Province--</option>';
    for (const x in provinces) {
        provMenuOptions += "<option value=" + provinces[x] + ">" + x + "</option>";
    }

    document.getElementById("provinceMenu").innerHTML = provMenuOptions;

    for (let i = 1; i <= 3; i++) {
        document.getElementsByTagName("form")[0].appendChild(document.createElement("br"));
        document.getElementsByTagName("form")[0].appendChild(document.createElement("br"));
        const newTable = document.createElement("table");
        newTable.innerHTML = makeTable(i);
        document.getElementsByTagName("form")[0].appendChild(newTable);
    }

});

function makeTable(tableNo) {
    const tableContents = 
    '<tr class="no-print" style="border:1px solid white">' +
        '<th></th>' +
        '<th><div class="no-print" style="display:inline-flex;"><label for="productMenu' + tableNo + '">Choose Product Type:</label><select class="no-print" name="productMenu" id="productMenu' + tableNo + '" style="font-size:18px;" tabindex="-1" onchange="chooseProductType()">' + typeMenuOptions + '</select></div></th>' +
        '<th></th>' +
    '</tr>' +
    '<tr>' +
        '<td>Product Type #' + tableNo + '</td>' +
        '<td colspan="2"><input class="reqFieldIfSelected' + tableNo + '" id="prodType' + tableNo + '" type="text" disabled="true" onkeyup="checkFieldEmpty()"></td>' +
    '</tr>' +
    '<tr>' +
        '<td>Model#</td>' +
        '<td colspan="2"><input class="reqFieldIfSelected' + tableNo + '" id="modelNo' + tableNo + '" type="text" disabled="true" onkeyup="checkFieldEmpty()"></td>' +
    '</tr>' +
    '<tr>' +
        '<td>Serial#</td>' +
        '<td colspan="2">' +
            '<div class="serialDiv">' +
                // change this class to reqFieldIfSelected + tableNo if serial number needed again
                '<input id="serialNo' + tableNo + '" type="text" disabled="true" onkeyup="checkFieldEmpty()">' +
                '<div class="specOrderDiv no-print" id="specOrderDiv' + tableNo + '" style="border:1px solid black;">' +
                    '<input type="checkbox" id="specOrderCheck' + tableNo + '" tabindex="-1" onclick="checkSpecOrder()">' +
                    '<label for="specOrderCheck' + tableNo + '">Special Order</label>' +
                '</div>' +
            '</div>' +
        '</td>' +
    '</tr>' +
    '<tr>' +
        '<td>Product purchase price</td>' +
        '<td colspan="2"><div style="display:flex;width:100%"><label>$</label><input class="reqFieldIfSelected' + tableNo + ' priceField" name="priceField" id="price' + tableNo + '"  type="number" min="0" step="0.01" style="text-align:left" disabled="true" onkeyup="checkFieldEmpty()" onkeydown="priceKeyPressed()" oninput="priceEntered()"></div></td>' +
    '</tr>' +
    '<tr>' +
        '<td>Purchase price of warranty / years</td>' +
        '<td style="border-right:none"><div style="display:flex;width:100%"><label>$</label><input disabled type="text" id="warrantyPrice' + tableNo + '" style="text-align:left"></div></td>' +
        '<td style="border-left:none"><div style="display:flex;width:100%"><input disabled id="warrantyLength' + tableNo + '" type="text" style="text-align:right;width: 50px"><label>/ yrs</label><div class="no-print" id="lengthDiv' + tableNo + '" style="display:none;"><label for="lengthMenu' + tableNo + '" style="font-size:14px;padding-left:20px;">Additional years:</label><select onchange="calculatePrices()" name="lengthMenu" id="lengthMenu' + tableNo + '" tabindex="-1"></select></div></div></td>' +
    '</tr>' +
    '<tr>' +
        '<td>Comerco warranty code</td>' +
        '<td colspan="2"><input disabled id="warrantyCode' + tableNo + '" type="text"></td>' +
    '</tr>';
    return tableContents;    
}
