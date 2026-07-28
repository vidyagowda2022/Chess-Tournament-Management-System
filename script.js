//DATA
let players = [];
let tournaments = [];

let editingPlayerId = null;
let editingTournamentId = null;


//PLAYER

function addPlayer(){

    let name = document.getElementById("playerInput").value.trim();

    if(name === ""){
        alert("Enter player name");
        return;
    }

    if(editingPlayerId !== null){

        let p = players.find(p => p.id == editingPlayerId);
        if(p) p.name = name;

        editingPlayerId = null;

    } else {

        players.push({
            id: Date.now().toString(),
            name: name,
            score: 0
        });
    }

    document.getElementById("playerInput").value = "";

    displayPlayers();
    updateDropdowns();
    updateRanking();
}


function displayPlayers(){

    let list = document.getElementById("playerList");
    list.innerHTML = "";

    players.forEach(p => {

        list.innerHTML += `
            <li>
                ${p.name}
                <button onclick="editPlayer('${p.id}')">Edit</button>
                <button onclick="deletePlayer('${p.id}')">Delete</button>
            </li>
        `;
    });
}


function editPlayer(id){

    let p = players.find(p => p.id == id);

    if(p){
        document.getElementById("playerInput").value = p.name;
        editingPlayerId = id;
    }
}


function deletePlayer(id){

    players = players.filter(p => p.id != id);

    tournaments.forEach(t => {
        t.players = t.players.filter(pid => pid != id);
    });

    displayPlayers();
    updateDropdowns();
    updateRanking();
}


//TOURNAMENT

function addTournament(){

    let name = document.getElementById("tournamentInput").value.trim();

    if(name === ""){
        alert("Enter tournament name");
        return;
    }

    if(editingTournamentId !== null){

        let t = tournaments.find(t => t.id == editingTournamentId);
        if(t) t.name = name;

        editingTournamentId = null;

    } else {

        tournaments.push({
            id: Date.now().toString(),
            name: name,
            players: [],
            completed: false
        });
    }

    document.getElementById("tournamentInput").value = "";

    displayTournaments();
    updateDropdowns();
}


function displayTournaments(){

    let list = document.getElementById("tournamentList");
    list.innerHTML = "";

    tournaments.forEach(t => {

        list.innerHTML += `
            <li>
                ${t.name}
                <button onclick="editTournament('${t.id}')">Edit</button>
                <button onclick="deleteTournament('${t.id}')">Delete</button>
            </li>
        `;
    });
}


function editTournament(id){

    let t = tournaments.find(t => t.id == id);

    if(t){
        document.getElementById("tournamentInput").value = t.name;
        editingTournamentId = id;
    }
}


function deleteTournament(id){

    tournaments = tournaments.filter(t => t.id != id);

    displayTournaments();
    updateDropdowns();

    document.getElementById("matchList").innerHTML = "";
}
function renderTeam(tournament){

    let div = document.getElementById("teamList");

    if(!div) return;

    div.innerHTML = "<h4>Players:</h4>";

    tournament.players.forEach(pid => {

        let p = players.find(pl => pl.id == pid);

        if(p){
            div.innerHTML += `<div>${p.name}</div>`;
        }
    });
}

//ASSIGN

function addPlayerTournament(){

    let playerId = document.getElementById("selectPlayer").value;
    let tournamentId = document.getElementById("selectTournament").value;

    if(!playerId || !tournamentId){
        alert("Select both player and tournament");
        return;
    }

    let t = tournaments.find(t => t.id == tournamentId);

    if(!t){
        alert("Tournament not found");
        return;
    }

    if(!t.players.includes(playerId)){
        t.players.push(playerId);
    }

    renderTeam(t);
    document.getElementById("selectPlayer").value = "";

    alert("Player assigned!");
}


//DROPDOWNS

function updateDropdowns(){

    let pSelect = document.getElementById("selectPlayer");
    let tSelect = document.getElementById("selectTournament");
    let mSelect = document.getElementById("matchTournament");

    if(!pSelect || !tSelect || !mSelect) return;

    pSelect.innerHTML = "<option value=''>Select Player</option>";
    tSelect.innerHTML = "<option value=''>Select Tournament</option>";
    mSelect.innerHTML = "<option value=''>Select Tournament</option>";

    players.forEach(p => {
        pSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });

    tournaments.forEach(t => {
        tSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
        mSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });
}


//MATCHES

function generateMatches(){

    let tournamentId = document.getElementById("matchTournament").value;

    if(!tournamentId){
        alert("Select tournament");
        return;
    }

    let t = tournaments.find(t => t.id == tournamentId);

    if(!t){
        alert("Tournament not found");
        return;
    }

    if(t.players.length < 2){
        alert("Need at least 2 players");
        return;
    }

    if(t.completed){
        alert("Matches already generated!");
        return;
    }

    let output = document.getElementById("matchList");
    output.innerHTML = "";

    for(let i = 0; i < t.players.length - 1; i += 2){

        let p1 = players.find(p => p.id == t.players[i]);
        let p2 = players.find(p => p.id == t.players[i+1]);

        if(!p1 || !p2) continue;

        let winner = Math.random() < 0.5 ? p1 : p2;

        const pointsAwarded = setWinner(winner.id);

        output.innerHTML += `
            <div>
                ${p1.name} vs ${p2.name} <br>
                <b>Winner: ${winner.name} (+${pointsAwarded} points)</b>
            </div>
        `;
    }

    t.completed = true;

    updateRanking();
}


//SCORE

function setWinner(playerId){

    let p = players.find(p => p.id == playerId);
    const points = Math.floor(Math.random() * 10) + 1;

    if(p){
        p.score += points;
        return points;
    }

    return 0;
}


//LEADERBOARD

function updateRanking(){

    let rank = document.getElementById("ranking");

    if(!rank) return;

    rank.innerHTML = "";

    players.sort((a,b) => b.score - a.score);

    players.forEach((p,i) => {
        const position = i + 1;
        const ordinal = position === 1 ? "1st" : position === 2 ? "2nd" : position === 3 ? "3rd" : `${position}th`;
        const medal = position === 1 ? "&#129351;" : position === 2 ? "&#129352;" : position === 3 ? '<span class="red-medal" aria-label="Red medal">3</span>' : "";
        const rankClass = position === 1 ? "gold" : position === 2 ? "silver" : position === 3 ? "red" : "";

        rank.innerHTML += `
            <div class="rank-card ${rankClass}">
                <span class="medal">${medal}</span>
                <span>${ordinal}. ${p.name} - ${p.score} points</span>
            </div>
        `;
    });
}


//INIT
function initializeApp(){
    updateDropdowns();
    updateRanking();
}

initializeApp();
