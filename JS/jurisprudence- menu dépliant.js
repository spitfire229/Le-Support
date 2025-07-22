let plied = true
function plier(num) {
    if(plied) {
        document.getElementById(num).style.maxHeight = '100%';
        plied = false;
    }
    else {
        document.getElementById(num).style.maxHeight = '60px';
        plied = true;
    }
};
