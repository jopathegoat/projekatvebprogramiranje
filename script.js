var pacijenti = [];

var btnDodajPacijenta = document.getElementById("btnDodajPacijenta");
var btnPrikaziPacijente = document.getElementById("btnPrikaziPacijente");
var btnPrimeni = document.getElementById("btnPrimeni");
var btnSacuvajIzmene = document.getElementById("btnSacuvajIzmene");

var formaSekcija = document.getElementById("formaSekcija");
var pacijentiSekcija = document.getElementById("pacijentiSekcija");

var patientForm = document.getElementById("patientForm");
var editForm = document.getElementById("editForm");

var imeInput = document.getElementById("ime");
var godineInput = document.getElementById("godine");
var visinaInput = document.getElementById("visina");
var tezinaInput = document.getElementById("tezina");
var napomenaInput = document.getElementById("napomena");

var filterKategorija = document.getElementById("filterKategorija");
var sortiranje = document.getElementById("sortiranje");

var patientsContainer = document.getElementById("patientsContainer");
var brojPacijenata = document.getElementById("brojPacijenata");

var modalUredi = new bootstrap.Modal(document.getElementById("modalUredi"));

btnDodajPacijenta.addEventListener("click", prikaziFormu);
btnPrikaziPacijente.addEventListener("click", prikaziPacijente);
btnPrimeni.addEventListener("click", prikaziKarticePacijenata);
patientForm.addEventListener("submit", dodajPacijenta);
btnSacuvajIzmene.addEventListener("click", sacuvajIzmene);

function prikaziFormu() {
  formaSekcija.classList.remove("d-none");
  pacijentiSekcija.classList.add("d-none");
}

function dodajPacijenta(e) {
  e.preventDefault();

  var ime = imeInput.value.trim();
  var godine = parseInt(godineInput.value);
  var visina = parseFloat(visinaInput.value);
  var tezina = parseFloat(tezinaInput.value);
  var napomena = napomenaInput.value.trim();

  var polRadio = document.querySelector('input[name="pol"]:checked');
  var pol;

  if (polRadio) {
    pol = polRadio.value;
  } else {
    pol = "Nije definisano";
  }

  if (
    ime == "" ||
    isNaN(godine) ||
    isNaN(visina) ||
    isNaN(tezina) ||
    godine <= 0 ||
    visina <= 0 ||
    tezina <= 0
  ) {
    alert("Unesi ispravne podatke.");
    return;
  }

  var bmi = izracunajBMI(visina, tezina);
  var kategorija = odrediKategorijuBMI(bmi);

  var podaci = new FormData(patientForm);

  podaci.append("bmi", bmi);
  podaci.append("kategorija", kategorija);

  var zahtev = new XMLHttpRequest();

  zahtev.open("POST", "php/dodaj_pacijenta.php", true);

  zahtev.onload = function () {
    alert(zahtev.responseText);

    patientForm.reset();
    document.getElementById("muski").checked = true;

    prikaziPacijente();
  };

  zahtev.send(podaci);
}

function izracunajBMI(visina, tezina) {
  return tezina / (visina * visina);
}

function odrediKategorijuBMI(bmi) {
  if (bmi < 18.5) {
    return "Pothranjenost";
  } else if (bmi < 25) {
    return "Normalna težina";
  } else if (bmi < 30) {
    return "Prekomerna težina";
  } else {
    return "Gojaznost";
  }
}

function prikaziPacijente() {
  formaSekcija.classList.add("d-none");
  pacijentiSekcija.classList.remove("d-none");

  var zahtev = new XMLHttpRequest();

  zahtev.open("GET", "php/prikazi_pacijente.php", true);

  zahtev.onload = function () {
    pacijenti = JSON.parse(zahtev.responseText);

    prikaziKarticePacijenata();
  };

  zahtev.send();
}

function prikaziKarticePacijenata() {
  patientsContainer.innerHTML = "";

  var listaZaPrikaz = [];

  for (var i = 0; i < pacijenti.length; i++) {
    listaZaPrikaz.push(pacijenti[i]);
  }

  var kategorijaFilter = filterKategorija.value;

  if (kategorijaFilter != "Sve") {
    var filtrirani = [];

    for (var i = 0; i < listaZaPrikaz.length; i++) {
      if (listaZaPrikaz[i].kategorija == kategorijaFilter) {
        filtrirani.push(listaZaPrikaz[i]);
      }
    }

    listaZaPrikaz = filtrirani;
  }

  var nacinSortiranja = sortiranje.value;

  if (nacinSortiranja == "min-max") {
    listaZaPrikaz.sort(function (a, b) {
      return a.bmi - b.bmi;
    });
  }

  if (nacinSortiranja == "max-min") {
    listaZaPrikaz.sort(function (a, b) {
      return b.bmi - a.bmi;
    });
  }

  brojPacijenata.textContent = listaZaPrikaz.length + " pacijenata";

  if (listaZaPrikaz.length == 0) {
    patientsContainer.innerHTML =
      '<div class="col-12">' +
      '<div class="empty-box p-5 text-center">' +
      '<h4 class="mb-2">Nema pacijenata za prikaz</h4>' +
      '<p class="text-muted mb-0">Dodaj pacijenta ili promeni filter.</p>' +
      "</div>" +
      "</div>";

    return;
  }

  for (var i = 0; i < listaZaPrikaz.length; i++) {
    var pacijent = listaZaPrikaz[i];

    var linija = "";
    var badge = "";

    if (pacijent.kategorija == "Pothranjenost") {
      linija = "line-pothranjenost";
      badge = "text-bg-info";
    } else if (pacijent.kategorija == "Normalna težina") {
      linija = "line-normalna";
      badge = "text-bg-success";
    } else if (pacijent.kategorija == "Prekomerna težina") {
      linija = "line-prekomerna";
      badge = "text-bg-warning";
    } else {
      linija = "line-gojaznost";
      badge = "text-bg-danger";
    }

    var napomenaTekst = "Nema napomene.";

    if (pacijent.napomena != "" && pacijent.napomena != null) {
      napomenaTekst = pacijent.napomena;
    }

    var slikaHTML = "";

    if (pacijent.slika != "" && pacijent.slika != null) {
      slikaHTML =
        '<img src="uploads/' +
        pacijent.slika +
        '" class="card-img-top slika-pacijenta">';
    }

    var kartica = document.createElement("div");
    kartica.className = "col-12 col-md-6 col-xl-4";
    kartica.innerHTML =
      '<div class="card patient-card">' +
      slikaHTML +
      '<div class="card-top-line ' +
      linija +
      '"></div>' +
      '<div class="card-body p-4">' +
      '<h4 class="card-title mb-3">' +
      pacijent.ime +
      "</h4>" +
      '<div class="info-line"><strong>Godine:</strong> ' +
      pacijent.godine +
      "</div>" +
      '<div class="info-line"><strong>Pol:</strong> ' +
      pacijent.pol +
      "</div>" +
      '<div class="info-line"><strong>Visina:</strong> ' +
      pacijent.visina +
      " m</div>" +
      '<div class="info-line"><strong>Težina:</strong> ' +
      pacijent.tezina +
      " kg</div>" +
      '<div class="info-line"><strong>BMI:</strong> ' +
      parseFloat(pacijent.bmi).toFixed(2) +
      "</div>" +
      '<div class="info-line"><strong>Kategorija:</strong> <span class="badge ' +
      badge +
      '">' +
      pacijent.kategorija +
      "</span></div>" +
      '<div class="mt-3"><strong>Napomena:</strong><p class="text-muted mb-0">' +
      napomenaTekst +
      "</p></div>" +
      '<div class="d-flex gap-2 mt-3">' +
      '<button class="btn btn-sm btn-outline-primary btn-uredi">Uredi</button>' +
      '<button class="btn btn-sm btn-outline-danger btn-obrisi">Obriši</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    var btnUredi = kartica.querySelector(".btn-uredi");
    var btnObrisi = kartica.querySelector(".btn-obrisi");

    (function (p) {
      btnUredi.addEventListener("click", function () {
        otvoriUrediModal(p);
      });
      btnObrisi.addEventListener("click", function () {
        obrisiPacijenta(p.id, p.ime);
      });
    })(pacijent);

    patientsContainer.appendChild(kartica);
  }
}

function otvoriUrediModal(pacijent) {
  document.getElementById("editId").value = pacijent.id;
  document.getElementById("editIme").value = pacijent.ime;
  document.getElementById("editGodine").value = pacijent.godine;
  document.getElementById("editVisina").value = pacijent.visina;
  document.getElementById("editTezina").value = pacijent.tezina;
  document.getElementById("editNapomena").value = pacijent.napomena || "";
  document.getElementById("editSlika").value = "";

  var polRadios = document.querySelectorAll('input[name="pol"]');
  for (var i = 0; i < polRadios.length; i++) {
    polRadios[i].checked = polRadios[i].value === pacijent.pol;
  }

  modalUredi.show();
}

function sacuvajIzmene() {
  var visina = parseFloat(document.getElementById("editVisina").value);
  var tezina = parseFloat(document.getElementById("editTezina").value);
  var ime = document.getElementById("editIme").value.trim();
  var godine = parseInt(document.getElementById("editGodine").value);

  if (
    ime == "" ||
    isNaN(godine) ||
    isNaN(visina) ||
    isNaN(tezina) ||
    godine <= 0 ||
    visina <= 0 ||
    tezina <= 0
  ) {
    alert("Unesi ispravne podatke.");
    return;
  }

  var bmi = izracunajBMI(visina, tezina);
  var kategorija = odrediKategorijuBMI(bmi);

  var podaci = new FormData(editForm);
  podaci.append("bmi", bmi);
  podaci.append("kategorija", kategorija);

  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", "php/uredi_pacijenta.php", true);

  zahtev.onload = function () {
    alert(zahtev.responseText);
    modalUredi.hide();
    prikaziPacijente();
  };

  zahtev.send(podaci);
}

function obrisiPacijenta(id, ime) {
  if (!confirm("Da li sigurno želiš da obrišeš pacijenta \"" + ime + "\"?")) {
    return;
  }

  var podaci = new FormData();
  podaci.append("id", id);

  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", "php/obrisi_pacijenta.php", true);

  zahtev.onload = function () {
    alert(zahtev.responseText);
    prikaziPacijente();
  };

  zahtev.send(podaci);
}
