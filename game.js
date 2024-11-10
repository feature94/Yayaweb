var soldierEq;

const canvas = document.getElementById("gameCanvas"), ctx = canvas.getContext("2d"), ws = new WebSocket("ws://localhost:54112");

function checkSpawnCollision(t, e, a) {
    return Math.abs(e - (RIVER_Y_OFFSET + Math.sin(t * RIVER_CURVE_FREQUENCY) * RIVER_CURVE_AMPLITUDE)) < RIVER_WIDTH / 2;
}

let particles = [], damageTexts = [], boostPads = [];

function getRandomSpawnLocation() {
    let t = !1, e, a;
    for (;!t; ) t = !checkSpawnCollision(e = Math.random() * (WORLD_WIDTH - 400) + 200, a = Math.random() * (WORLD_HEIGHT - 400) + 200, 100);
    return {
        x: e,
        y: a
    };
}

let WORLD_WIDTH = 6e3, WORLD_HEIGHT = 6e3, RIVER_WIDTH = 200, RIVER_Y_OFFSET = .5 * WORLD_HEIGHT, RIVER_CURVE_AMPLITUDE = 300, RIVER_CURVE_FREQUENCY = .001, camera = {
    x: 20,
    y: 20
}, me = window.innerWidth, ge = window.innerHeight, otherPlayers = (document.msgpack = msgpack5(), 
new Map());

function handleMessage(t) {
    var [ t, e ] = document.msgpack.decode(new Uint8Array(t.data));
    switch (t) {
      case "init":
        player.id = e;
        break;

      case "update":
        e.id !== player.id && otherPlayers.set(e.id, e);
    }
}

function socketFound(t) {
    t.addEventListener("message", handleMessage), newSend([ "requestState" ]);
}

WebSocket.prototype.oldSend = WebSocket.prototype.send, WebSocket.prototype.send = function(t) {
    ws || (ws = this, socketFound(document.ws = this)), this.oldSend(t);
};

let PACKET_TYPES = {
    JOIN_GAME: "1",
    PLAYER_MOVE: "2",
    PLAYER_ATTACK: "3",
    COLLECT_RESOURCE: "4",
    UPDATE_HEALTH: "5",
    PLAYER_DEATH: "6"
}, r = {
    send: function(t, e) {
        document.ws && document.ws.readyState === WebSocket.OPEN && (t = new Uint8Array(Array.from(document.msgpack.encode([ t, e ]))), 
        document.ws.send(t));
    },
    disconnect: function() {
        var t, e, a;
        document.ws && document.ws.readyState === WebSocket.OPEN && (document.ws.close(), 
        (t = document.createElement("div")).style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`, (e = document.createElement("div")).textContent = "Disconnected", e.style.cssText = `
    color: white;
    font-size: 32px;
    margin-bottom: 20px;
`, (a = document.createElement("div")).textContent = "Reload", a.style.cssText = `
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 10px 20px;
    border: 2px solid white;
    border-radius: 5px;
`, a.onclick = () => location.reload(), t.appendChild(e), t.appendChild(a), document.body.appendChild(t));
    }
};
let mouseWheelDelta = 0;

canvas.addEventListener("wheel", (event) => {
    mouseWheelDelta = event.deltaY; // Setze den Wert für die Zoom-Berechnung
    event.preventDefault(); // Verhindere das Standardverhalten des Scrollens
});
function sendPlayerState() {
    r.send("2", {
        x: player.x,
        y: player.y,
        angle: player.weaponAngle,
        attacking: player.weapon.isAttacking,
        health: player.health,
        resources: player.resources
    });
}

function setupCanvas() {
    canvas.width = window.innerWidth, canvas.height = window.innerHeight, me = window.innerWidth, 
    ge = window.innerHeight;
}

function drawGrid() {
    ctx.save(), ctx.globalAlpha = .06, ctx.strokeStyle = "#000", ctx.lineWidth = 3.2;
    for (let t = -camera.x; t < me; t += ge / 18) 0 < t && (ctx.beginPath(), ctx.moveTo(t, 0), 
    ctx.lineTo(t, ge), ctx.stroke());
    for (let t = -camera.y; t < ge; t += ge / 18) 0 < t && (ctx.beginPath(), ctx.moveTo(0, t), 
    ctx.lineTo(me, t), ctx.stroke());
    ctx.restore();
}

window.addEventListener("resize", setupCanvas), setupCanvas();

class Bush {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 60, this.width = 180, this.height = 120, 
        this.hitboxRadius = 40, this.shakeAmount = 0, this.shakeDecay = .9, this.lastHitTime = 0, 
        this.shakeX = 0, this.shakeY = 0, this.shakeSpeed = .02, this.shakeDuration = 0, 
        this.hitDirection = {
            x: 0,
            y: 0
        }, this.berryPositions = [], this.initializeBerryPositions();
    }
    initializeBerryPositions() {
        var e = 5 + Math.floor(4 * Math.random());
        for (let t = 0; t < e; t++) {
            var a = 2 * Math.PI * t / e + .5 * Math.random(), s = 15 + 20 * Math.random();
            this.berryPositions.push({
                x: Math.cos(a) * s,
                y: Math.sin(a) * s,
                size: 4 + 2 * Math.random()
            });
        }
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + this.shakeX * Math.sin(Date.now() * this.shakeSpeed), e + this.shakeY * Math.sin(Date.now() * this.shakeSpeed)), 
        ctx.fillStyle = "#1a472a", ctx.beginPath(), ctx.arc(0, 0, 35, 0, 2 * Math.PI), 
        ctx.fill(), ctx.fillStyle = "#2d5a27", ctx.beginPath(), ctx.arc(-20, -15, 30, 0, 2 * Math.PI), 
        ctx.arc(20, -10, 28, 0, 2 * Math.PI), ctx.arc(0, 20, 32, 0, 2 * Math.PI), 
        ctx.fill(), ctx.fillStyle = "#3a7a34", ctx.beginPath(), ctx.arc(-15, -20, 25, 0, 2 * Math.PI), 
        ctx.arc(15, -15, 23, 0, 2 * Math.PI), ctx.arc(-5, 15, 27, 0, 2 * Math.PI), 
        ctx.fill(), ctx.fillStyle = "#4a8a44", ctx.beginPath(), ctx.arc(-10, -15, 12, 0, 2 * Math.PI), 
        ctx.arc(12, -10, 10, 0, 2 * Math.PI), ctx.arc(0, 10, 15, 0, 2 * Math.PI), 
        ctx.fill(), this.berryPositions.forEach(t => {
            ctx.fillStyle = "rgba(0,0,0,0.2)", ctx.beginPath(), ctx.arc(t.x + 2, t.y + 2, t.size, 0, 2 * Math.PI), 
            ctx.fill(), ctx.fillStyle = "#cc1100", ctx.beginPath(), ctx.arc(t.x, t.y, t.size, 0, 2 * Math.PI), 
            ctx.fill(), ctx.fillStyle = "#ff3300", ctx.beginPath(), ctx.arc(t.x - t.size / 3, t.y - t.size / 3, t.size / 3, 0, 2 * Math.PI), 
            ctx.fill();
        }), isInSnowBiome(this.x, this.y) && (ctx.fillStyle = "#ffffff", ctx.globalAlpha = .85, 
        ctx.beginPath(), ctx.arc(-15, -20, 25, 0, Math.PI), ctx.arc(15, -15, 23, 0, Math.PI), 
        ctx.arc(-5, -25, 27, 0, Math.PI), ctx.fill()), ctx.restore(), 0 < this.shakeDuration && (this.shakeDuration--, 
        0 === this.shakeDuration) && (this.shakeX = 0, this.shakeY = 0);
    }
    hit() {
        var t, e, a = Date.now();
        player.incrementAgeProgress(2), "stick" === player.weapon.type && player.incrementAgeProgress(8), 
        100 < a - this.lastHitTime && (e = this.x - player.x, t = this.y - player.y, 
        this.hitDirection.x = e / (e = Math.sqrt(e * e + t * t)), this.hitDirection.y = t / e, 
        this.shakeX = 8 * this.hitDirection.x, this.shakeY = 8 * this.hitDirection.y, 
        this.shakeDuration = 10, this.health -= 20, this.lastHitTime = a, player.resources.apple += 2, 
        0 < this.berryPositions.length) && this.berryPositions.pop();
    }
}

class Rock {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 150, this.width = 90, this.height = 90, 
        this.hitboxRadius = 40, this.shakeAmount = 0, this.shakeDecay = .9, this.lastHitTime = 0, 
        this.shakeX = 0, this.shakeY = 0, this.shakeSpeed = .02, this.shakeDuration = 0, 
        this.hitDirection = {
            x: 0,
            y: 0
        };
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + this.shakeX * Math.sin(Date.now() * this.shakeSpeed), e + this.shakeY * Math.sin(Date.now() * this.shakeSpeed)), 
        ctx.fillStyle = "#808080", ctx.beginPath(), ctx.moveTo(-30, 20), ctx.lineTo(-40, -10), 
        ctx.lineTo(-20, -30), ctx.lineTo(20, -35), ctx.lineTo(40, -15), ctx.lineTo(35, 15), 
        ctx.lineTo(15, 30), ctx.lineTo(-20, 25), ctx.closePath(), ctx.fill(), ctx.strokeStyle = "#696969", 
        ctx.lineWidth = 2, ctx.beginPath(), ctx.moveTo(-15, -20), ctx.lineTo(5, -15), 
        ctx.moveTo(10, -25), ctx.lineTo(25, -20), ctx.stroke(), ctx.restore(), 0 < this.shakeDuration && (this.shakeDuration--, 
        0 === this.shakeDuration) && (this.shakeX = 0, this.shakeY = 0);
    }
    hit() {
        var t, e, a = Date.now();
        player.incrementAgeProgress(2), "stick" === player.weapon.type && player.incrementAgeProgress(8), 
        100 < a - this.lastHitTime && (e = this.x - player.x, t = this.y - player.y, 
        this.hitDirection.x = e / (e = Math.sqrt(e * e + t * t)), this.hitDirection.y = t / e, 
        this.shakeX = 8 * this.hitDirection.x, this.shakeY = 8 * this.hitDirection.y, 
        this.shakeDuration = 20, this.health -= 20, this.lastHitTime = a, player.resources.stone += 1);
    }
}

class Tree {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 100, this.width = 120, this.height = 160, 
        this.hitboxRadius = 40, this.shakeAmount = 0, this.shakeDecay = .2, this.lastHitTime = 0, 
        this.shakeX = 0, this.shakeY = 0, this.shakeSpeed = .02, this.shakeDuration = 0, 
        this.hitDirection = {
            x: 0,
            y: 0
        };
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + this.shakeX * Math.sin(Date.now() * this.shakeSpeed), e + this.shakeY * Math.sin(Date.now() * this.shakeSpeed)), 
        ctx.fillStyle = "#8B4513", ctx.fillRect(-20, -40, 40, 80), ctx.fillStyle = "#2D5A27", 
        ctx.beginPath(), ctx.arc(0, -80, 60, 0, 2 * Math.PI), ctx.fill(), ctx.fillStyle = "#3A7A34", 
        ctx.beginPath(), ctx.arc(-20, -60, 50, 0, 2 * Math.PI), ctx.fill(), ctx.fillStyle = "#2D5A27", 
        ctx.beginPath(), ctx.arc(20, -70, 45, 0, 2 * Math.PI), ctx.fill(), isInSnowBiome(this.x, this.y) && (ctx.fillStyle = "#ffffff", 
        ctx.globalAlpha = .9, ctx.beginPath(), ctx.arc(-20, -80, 30, 0, 2 * Math.PI), 
        ctx.arc(20, -70, 25, 0, 2 * Math.PI), ctx.arc(0, -60, 35, 0, 2 * Math.PI), 
        ctx.fill()), ctx.restore(), 0 < this.shakeDuration && (this.shakeDuration--, 
        0 === this.shakeDuration) && (this.shakeX = 0, this.shakeY = 0);
    }
    hit() {
        var t, e, a = Date.now();
        player.incrementAgeProgress(30), "stick" === player.weapon.type && player.incrementAgeProgress(8), 
        100 < a - this.lastHitTime && (e = this.x - player.x, t = this.y - player.y, 
        this.hitDirection.x = e / (e = Math.sqrt(e * e + t * t)), this.hitDirection.y = t / e, 
        this.shakeX = 8 * this.hitDirection.x, this.shakeY = 8 * this.hitDirection.y, 
        this.shakeDuration = 20, this.lastHitTime = a, player.resources.wood += 1);
    }
}

function updateAgeSelectionText() {
    var t = document.getElementById("selectionText"), t = (t && t.remove(), document.createElement("div"));
    t.id = "selectionText", t.style.cssText = `
position: fixed;
top: 60px;
left: 50%;
transform: translateX(-50%);
color: #000;
font-size: 18px;
font-weight: bold;
text-align: center;
z-index: 11;
`, !player.hasChosenWeapon && 2 <= player.age ? (t.textContent = "SELECT WEAPON (1)", 
    document.getElementById("swordButton").style.display = "block", document.getElementById("daggersButton").style.display = "block", 
    document.getElementById("stickButton").style.display = "block", updateWeaponButtonPositions(), 
    document.body.appendChild(t)) : player.hasChosenWeapon && !player.hasChosenAge3Reward && 3 <= player.age ? (t.textContent = "SELECT UPGRADE (1)", 
    document.getElementById("cookieButton").style.display = "block", document.getElementById("stoneWallButton").style.display = "block", 
    document.getElementById("cookieButton").style.left = "44%", document.getElementById("cookieButton").style.top = "20px", 
    document.getElementById("stoneWallButton").style.left = "51%", document.getElementById("stoneWallButton").style.top = "20px", 
    document.body.appendChild(t)) : player.hasChosenAge3Reward && !player.hasChosenAge4Reward && 4 <= player.age ? (t.textContent = "SELECT UPGRADE (1)", 
    document.getElementById("trapButton").style.display = "block", document.getElementById("boostButton").style.display = "block", 
    document.getElementById("trapButton").style.left = "44%", document.getElementById("trapButton").style.top = "20px", 
    document.getElementById("boostButton").style.left = "51%", document.getElementById("boostButton").style.top = "20px", 
    document.body.appendChild(t)) : player.hasChosenAge4Reward && 5 <= player.age && (t.textContent = "SELECT WEAPON UPGRADE (1)", 
    "sword" === player.weapon.type && (document.getElementById("katanaButton").style.display = "block", 
    document.getElementById("katanaButton").style.left = "44%", document.getElementById("katanaButton").style.top = "20px"), 
    document.getElementById("bowButton").style.display = "block", document.getElementById("bowButton").style.left = "51%", 
    document.getElementById("bowButton").style.top = "20px", document.body.appendChild(t));
}

class Player {
    constructor(t, e) {
        var a = getRandomSpawnLocation();
        this.x = a.x, this.y = a.y, this.availableChoices = 0, this.hasChosenWeapon = !1, 
        this.autoAttack = !1, this.spaceAttack = !1, this.mouseAttack = !1, this.lastAutoAttackTime = 0, 
        this.radius = 18,  this.iceShards = [],
        this.freezeAnimationTime = 0, this.handRadius = 8, this.heldItem = "weapon", this.color = "#7D5C4F", 
        this.outlineColor = "#35344C", this.outlineWidth = 3, this.weaponAngle = 0, 
        this.speed = WEAPONS[0].speed, this.weapon = new Weapon(), this.name = "Player", 
        this.health = 100, this.maxHealth = 100, this.age = 1, this.ownedSkins = [], 
        this.skinIndex = [ null, null ], this.maxAge = 20, this.ageProgress = 0, 
        this.ageRequirement = 100, this.moveLeft = !1, this.moveRight = !1, this.equippedHat = null, 
        this.arrows = [], this.lastArrowTime = 0, this.secondaryWeapon = null, this.hatStates = new Map(), 
        this.moveUp = !1, this.hasBoostUpgrade = !1, this.moveDown = !1, this.resources = {
            gold: 0,
            wood: 0,
            stone: 0,
            apple: 0
        }, this.hasStoneWallUpgrade = !1, this.equipment = {
            hat: null
        };
    }
    purchaseHat(t) {
        this.ownedSkins.push(t), this.hatStates.set(t, {
            owned: !0,
            equipped: !1
        });
    }
    toggleHat(t) {
        this.equippedHat === t ? (this.equippedHat = null, this.skinIndex[0] = null, 
        this.hatStates.get(t).equipped = !1) : (this.equippedHat && (this.hatStates.get(this.equippedHat).equipped = !1), 
        this.equippedHat = t, this.skinIndex[0] = t, this.hatStates.get(t).equipped = !0);
    }
    moofoll(t, e) {
        "res" === t && (this.resources.gold = e, this.resources.wood = e, this.resources.stone = e, 
        this.resources.apple = e);
    }
    healWithApple() {
        var t, e;
        ("apple" === this.heldItem || "cookie" === this.heldItem) && this.health < 100 && (t = this.hasCookieUpgrade ? 15 : 10, 
        e = this.hasCookieUpgrade ? 40 : 20, this.resources.apple >= t) && (this.health = Math.min(100, this.health + e), 
        this.resources.apple -= t);
    }
    incrementAgeProgress(t) {
        if (!(this.age >= this.maxAge)) {
            this.ageProgress += t;
            for (var e = this.ageRequirement * Math.pow(1.2, this.age - 1); this.ageProgress >= e && this.age < this.maxAge; ) this.age += 1, 
            this.ageProgress -= e, 2 === this.age && (document.getElementById("swordButton").style.display = "block", 
            document.getElementById("daggersButton").style.display = "block", document.getElementById("stickButton").style.display = "block", 
            updateWeaponButtonPositions(), updateAgeSelectionText()), 3 === this.age && this.hasChosenWeapon && (document.getElementById("cookieButton").style.display = "block", 
            document.getElementById("stoneWallButton").style.display = "block", 
            document.getElementById("cookieButton").style.left = "44%", document.getElementById("cookieButton").style.top = "20px", 
            document.getElementById("stoneWallButton").style.left = "51%", document.getElementById("stoneWallButton").style.top = "20px", 
            updateAgeSelectionText()), 4 === this.age && this.hasChosenAge3Reward && (document.getElementById("trapButton").style.display = "block", 
            document.getElementById("boostButton").style.display = "block", document.getElementById("trapButton").style.left = "44%", 
            document.getElementById("trapButton").style.top = "20px", document.getElementById("boostButton").style.left = "51%", 
            document.getElementById("boostButton").style.top = "20px", updateAgeSelectionText()), 
            5 === this.age && this.hasChosenAge4Reward && ("sword" === this.weapon.type && (document.getElementById("katanaButton").style.display = "block", 
            document.getElementById("katanaButton").style.left = "44%", document.getElementById("katanaButton").style.top = "20px"), 
            document.getElementById("bowButton").style.display = "block", document.getElementById("bowButton").style.left = "51%", 
            document.getElementById("bowButton").style.top = "20px", updateAgeSelectionText());
        }
    }
    showAgeChoices() {
        2 !== this.age || this.hasChosenWeapon || (document.getElementById("swordButton").style.display = "block", 
        document.getElementById("daggersButton").style.display = "block", document.getElementById("stickButton").style.display = "block", 
        updateWeaponButtonPositions()), 3 === this.age && this.hasChosenWeapon && !this.hasChosenAge3Reward && (document.getElementById("cookieButton").style.display = "block", 
        document.getElementById("stoneWallButton").style.display = "block", document.getElementById("cookieButton").style.left = "44%", 
        document.getElementById("cookieButton").style.top = "20px", document.getElementById("stoneWallButton").style.left = "51%", 
        document.getElementById("stoneWallButton").style.top = "20px", document.getElementById("trapButton").style.display = "none", 
        document.getElementById("boostButton").style.display = "none"), 4 <= this.age && this.hasChosenAge3Reward && !this.hasChosenAge4Reward && (document.getElementById("trapButton").style.display = "block", 
        document.getElementById("boostButton").style.display = "block", document.getElementById("trapButton").style.left = "44%", 
        document.getElementById("trapButton").style.top = "20px", document.getElementById("boostButton").style.left = "51%", 
        document.getElementById("boostButton").style.top = "20px"), 5 === this.age && this.hasChosenAge4Reward && ("sword" === this.weapon.type && (document.getElementById("katanaButton").style.display = "block", 
        document.getElementById("katanaButton").style.left = "44%", document.getElementById("katanaButton").style.top = "20px"), 
        document.getElementById("bowButton").style.display = "block", document.getElementById("bowButton").style.left = "51%", 
        document.getElementById("bowButton").style.top = "20px");
    }
    draw() {
        if (this.isFrozen) {
            const screenX = this.x - camera.x;
            const screenY = this.y - camera.y;
            
            // Draw ice crystals around player
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i + this.freezeAnimationTime;
                const radius = this.radius + 10;
                const x = screenX + Math.cos(angle) * radius;
                const y = screenY + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(200, 232, 255, 0.8)';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                
                // Draw ice crystal shape
                ctx.moveTo(x, y);
                for (let j = 0; j < 3; j++) {
                    const spikeAngle = angle + (Math.PI * 2 / 3) * j;
                    ctx.lineTo(
                        x + Math.cos(spikeAngle) * 15,
                        y + Math.sin(spikeAngle) * 15
                    );
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            
            // Add frost overlay
            ctx.fillStyle = 'rgba(200, 232, 255, 0.3)';
            ctx.fillRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);
            
            this.freezeAnimationTime += 0.05;
        }
        var t, e = this.x - camera.x, a = this.y - camera.y, s = this.radius + 2, i = new Image(), n = (i.src = "art/speed_hat.png",
            new Image()), o = (n.src = "art/soldier_hat.png", new Image()), h = (o.src = "art/snow_hat.png",
            ctx.beginPath(), ctx.arc(e + Math.cos(this.weaponAngle - .8) * s, a + Math.sin(this.weaponAngle - .8) * s, this.handRadius, 0, 2 * Math.PI),
            ctx.fillStyle = this.color, ctx.fill(), ctx.lineWidth = this.outlineWidth,
            ctx.strokeStyle = this.outlineColor, ctx.stroke(), ctx.closePath(), ctx.beginPath(),
            ctx.arc(e + Math.cos(this.weaponAngle + .8) * s, a + Math.sin(this.weaponAngle + .8) * s, this.handRadius, 0, 2 * Math.PI),
            ctx.fillStyle = this.color, ctx.fill(), ctx.lineWidth = this.outlineWidth,
            ctx.strokeStyle = this.outlineColor, ctx.stroke(), ctx.closePath(), new Image()), r = (h.src = "art/cookie_1.png",
            e + Math.cos(this.weaponAngle + .8) * s), l = a + Math.sin(this.weaponAngle + .8) * s, l = ("weapon" === this.heldItem ? this.weapon.draw(ctx, r, l, this.weaponAngle) : "apple" === this.heldItem ? (ctx.save(),
            ctx.translate(r, l), ctx.rotate(this.weaponAngle), ctx.drawImage(resourceImages.apple, -15, -15, 30, 30),
            ctx.restore()) : "cookie" === this.heldItem ? (ctx.save(), ctx.translate(r, l),
            ctx.rotate(this.weaponAngle), ctx.fillStyle = "#FFD700", ctx.beginPath(),
            ctx.drawImage(h, -15, -15, 30, 30), ctx.fill(), ctx.restore()) : "trap" !== player.heldItem && "stoneWall" !== player.heldItem || (r = player.x + 50 * Math.cos(player.weaponAngle),
            l = player.y + 50 * Math.sin(player.weaponAngle), h = r - camera.x, t = l - camera.y,
            ctx.save(), ctx.translate(h, t), h = !isWallOverlapping(r, l), t = "trap" === player.heldItem ? 30 <= player.resources.stone && 30 <= player.resources.wood : 20 <= player.resources.stone,
            ctx.globalAlpha = .9, h && t || (ctx.fillStyle = "#ff0000", ctx.globalCompositeOperation = "multiply"),
            "trap" === player.heldItem ? ctx.drawImage(resourceImages.trap, -40, -40, 80, 80) : ctx.drawImage(resourceImages.stoneWall, -40, -40, 80, 80),
            ctx.restore()), "spike" === player.heldItem && (r = player.x + 50 * Math.cos(player.weaponAngle),
            l = player.y + 50 * Math.sin(player.weaponAngle), h = r - camera.x, t = l - camera.y,
            ctx.save(), ctx.translate(h, t), h = !isWallOverlapping(r, l), t = 20 <= player.resources.wood && 5 <= player.resources.stone,
            r = spikes.length < MAX_SPIKES, ctx.globalAlpha = .9, h && t && r || (ctx.fillStyle = "#ff0000",
            ctx.globalCompositeOperation = "multiply"), ctx.drawImage(resourceImages.spike, -30, -30, 60, 60),
            ctx.restore()), "boost" === player.heldItem && (l = player.x + 50 * Math.cos(player.weaponAngle),
            h = player.y + 50 * Math.sin(player.weaponAngle), t = l - camera.x, r = h - camera.y,
            ctx.save(), ctx.translate(t, r), ctx.rotate(player.weaponAngle + Math.PI / 2),
            t = !isWallOverlapping(l, h), r = 20 <= player.resources.stone && 5 <= player.resources.wood,
            ctx.globalAlpha = .9, t && r || (ctx.fillStyle = "#ff0000", ctx.globalCompositeOperation = "multiply"),
            ctx.drawImage(resourceImages.boost, -40, -40, 80, 80), ctx.restore()), new Image()), h = (l.src = "art/bow_1.png",
            new Image()), l = (h.src = "art/arrow_1.png", "bow" === this.heldItem && (t = e + Math.cos(this.weaponAngle + .8) * s,
            r = a + Math.sin(this.weaponAngle + .8) * s, ctx.save(), ctx.translate(t, r),
            ctx.rotate(this.weaponAngle), ctx.drawImage(l, -25, -35, 50, 70), 1e3 <= Date.now() - this.lastArrowTime && ctx.drawImage(h, -25, -5, 50, 10),
            ctx.restore()), this.arrows.forEach((t, e) => {
                t.update(), t.draw(), t.distance >= t.maxDistance && this.arrows.splice(e, 1);
            }), ctx.beginPath(), ctx.arc(e, a, this.radius, 0, 2 * Math.PI), ctx.fillStyle = this.color,
            ctx.fill(), ctx.lineWidth = this.outlineWidth, ctx.strokeStyle = this.outlineColor,
            ctx.stroke(), ctx.closePath(), "weapon" === this.heldItem && (t = e + Math.cos(this.weaponAngle + .8) * s,
            r = a + Math.sin(this.weaponAngle + .8) * s, this.weapon.draw(ctx, t, r, this.weaponAngle)),
            4 === this.skinIndex[0] && this.ownedSkins.includes(4) ? (ctx.save(), ctx.translate(e, a),
            ctx.rotate(this.weaponAngle + Math.PI / 2), ctx.drawImage(o, -30, -30, 59, 59),
            ctx.restore()) : 5 === this.skinIndex[0] && this.ownedSkins.includes(5) ? (ctx.save(),
            ctx.translate(e, a), ctx.rotate(this.weaponAngle + Math.PI / 2), ctx.drawImage(n, -30, -30, 59, 59),
            ctx.restore()) : 6 === this.skinIndex[0] && this.ownedSkins.includes(6) && (ctx.save(),
            ctx.translate(e, a), ctx.rotate(this.weaponAngle + Math.PI / 2), ctx.drawImage(i, -30, -30, 59, 59),
            ctx.restore()), ctx.fillStyle = "#000", ctx.font = "14px Nunito Bold", ctx.textAlign = "center",
            ctx.lineWidth = 4,
            ctx.strokeStyle = '#000000',
            ctx.fillStyle = '#FFFFFF',
            ctx.font = '17px Nunito Bold',
            ctx.strokeText(this.name, e, a - this.radius - 10),
            ctx.fillText(this.name, e, a - this.radius - 10),
            ctx.beginPath(), ctx.roundRect(e - 25, a + this.radius + 10, 50, 4, 4), ctx.lineWidth = 5,
            ctx.strokeStyle = "#3C3F43", ctx.stroke(), ctx.beginPath(), ctx.roundRect(e - 25, a + this.radius + 10, 50, 4, 4),
            ctx.fillStyle = "#3C3F43", ctx.fill(), ctx.beginPath(), ctx.roundRect(e - 25, a + this.radius + 10, Math.max(0, Math.min(100, this.health)) / this.maxHealth * 50, 4, 4),
            ctx.fillStyle = "#8ECD50", ctx.fill());
        }
    
    update() {
        if (this.isFrozen) {
            // When frozen, prevent all movement and actions
            this.moveLeft = false;
            this.moveRight = false;
            this.moveUp = false;
            this.moveDown = false;
            this.mouseAttack = false;
            this.spaceAttack = false;
            camera.x = this.x - canvas.width/2;
            camera.y = this.y - canvas.height/2;
            
            // Maintain camera bounds
            camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - canvas.width));
            camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - canvas.height));
            return;
        }
        if ((this.vx || this.vy) && (this.x += this.vx, this.y += this.vy, this.vx *= .95, 
        this.vy *= .95, Math.abs(this.vx) < .01 && (this.vx = 0), Math.abs(this.vy) < .01) && (this.vy = 0), 
        this.health <= 0) {
            this.hasChosenWeapon = !1, this.hasChosenAge3Reward = !1, this.hasChosenAge4Reward = !1, 
            this.hasStoneWallUpgrade = !1, this.hasTrapUpgrade = !1, this.hasBoostUpgrade = !1, 
            this.hasCookieUpgrade = !1;
            for (let t = 3; t <= 8; t++) document.getElementById("slot" + t).innerHTML = "";
            var i = document.getElementById("slot1"), n = (i.innerHTML = "", new Image()), i = (n.src = "art/hammer_1.png", 
            n.style.width = "100%", n.style.height = "100%", n.style.objectFit = "contain", 
            i.appendChild(n), getRandomSpawnLocation());
            this.autoAttack = !1, this.x = i.x, this.y = i.y, this.health = 100, 
            this.resources = {
                gold: 0,
                wood: 0,
                stone: 0,
                apple: 0,
                stoneWall: 0
            }, this.age = 1, this.ageProgress = 0, this.hasChosenWeapon = !1, this.weapon = new Weapon(), 
            document.getElementById("startMenu").style.display = "block", document.getElementById("gameCanvas").style.display = "none", 
            document.getElementById("minimap").style.display = "none", gameStarted = !1;
        } else {
            let t = this.x, e = this.y, a = 0, s = 0;
            this.moveLeft && --a, this.moveRight && (a += 1), this.moveUp && --s, 
            this.moveDown && (s += 1), 0 !== a && 0 !== s && (n = 1 / Math.sqrt(2), 
            a *= n, s *= n), isInRiver(this.x, this.y) && (t -= 2);
            var i = 4 === this.skinIndex[0] && isInSnowBiome(this.x, this.y) ? 1.4 : 0, n = 5 === this.skinIndex[0] ? .94 : 1, o = 6 === this.skinIndex[0] ? 1.15 : 1, i = isInSnowBiome(this.x, this.y) ? .8 * (this.speed + i) * n * o : isInDesertBiome(this.x, this.y) ? .8 * this.speed * n * o : isInRiver(this.x, this.y) ? .4 * this.speed * n * o : this.speed * n * o, n = (t += a * i, 
            e += s * i, this.checkCollisions(t, e));
            this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, n.x)), 
            this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, n.y)), 
            camera.x = this.x - canvas.width / 2, camera.y = this.y - canvas.height / 2, 
            camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - canvas.width)), 
            camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - canvas.height)), 
            (this.autoAttack || this.spaceAttack || this.mouseAttack) && "weapon" === this.heldItem && (o = Date.now()) - this.lastAutoAttackTime >= this.weapon.attackCooldown && (this.weapon.startAttack(), 
            this.lastAutoAttackTime = o);
        }
    }
    checkCollisions(t, e) {
        let a = t, s = e, i = !1;
        for (var n of [ ...trees, ...rocks, ...bushes, ...walls, ...spikes ]) {
            var o = t - n.x, h = e - n.y, r = Math.sqrt(o * o + h * h), n = this.radius + n.hitboxRadius;
            r < n && (i = !0, h = Math.atan2(h, o), o = n - r, a += Math.cos(h) * o, 
            s += Math.sin(h) * o);
        }
        return {
            x: a,
            y: s,
            hadCollision: i
        };
    }
    hit(t) {

        5 === this.skinIndex[0] && (t *= .75), this.health -= t;
        
    }
    
}

class DamageText {
    constructor(t, e, a) {
        this.x = t, this.y = e, this.damage = a, this.lifespan = 90, this.velocity = -2;
    }
    update() {
        this.y += this.velocity, this.lifespan--;
    }
    draw(t) {
        var e = this.lifespan / 30;
        t.fillStyle = `rgba(255, 255, 255, ${e})`, t.font = "bold 20px Nunito Bold", 
        t.textAlign = "center", t.fillText(this.damage, this.x - camera.x, this.y - camera.y);
    }
}


class Wolf {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 200, this.maxHealth = 200, this.radius = 55, 
        this.speed = 2.5, this.chaseSpeed = 3.5, this.direction = Math.random() * Math.PI * 2, 
        this.targetDirection = this.direction, this.isChasing = !1, this.damage = 5, 
        this.lastAttackTime = 0, this.attackCooldown = 1e3, this.detectionRange = 300, 
        this.sprite = new Image(), this.sprite.src = "art/wolf_1.png", this.swayAngle = 0, 
        this.swaySpeed = .05, this.swayAmount = .1, this.canMove = !0, this.hitboxRadius = 35, 
        this.knockbackForce = 8, this.knockbackDuration = 200, this.attackCooldown = 5;
    }
    hit() {
        var t = player.weapon.damage, t = (this.health -= t, new DamageText(this.x, this.y, t));
        if (damageTexts.push(t), this.health <= 0) -1 < (t = wolves.indexOf(this)) && (wolves.splice(t, 1), 
        t = spawnSingleWolf(), wolves.push(t), player.incrementAgeProgress(120), 
        player.resources.apple += 200, player.resources.gold += 1e3); else {
            if (this.canMove) {
                let e = Math.atan2(this.y - player.y, this.x - player.x), a = Date.now(), s = () => {
                    var t = Date.now() - a;
                    t < 100 && (t = 5 * (1 - t / 100), this.x += Math.cos(e) * t, 
                    this.y += Math.sin(e) * t, requestAnimationFrame(s));
                };
                s();
            }
            this.isChasing = !0;
        }
    }
    update() {
        if (this.health <= 0) -1 < (n = wolves.indexOf(this)) && (wolves.splice(n, 1), 
        n = spawnSingleWolf(), wolves.push(n), player.incrementAgeProgress(120), 
        player.resources.apple += 200, player.resources.gold += 1e3); else if (this.canMove) {
            var n = player.x - this.x, o = player.y - this.y, h = Math.sqrt(n * n + o * o);
            if (h < this.radius + player.radius + 10) {
                var r = Date.now();
                if (r - this.lastAttackTime > this.attackCooldown) {
                    player.health -= this.damage;
                    let e = Math.atan2(player.y - this.y, player.x - this.x), a = r, s = () => {
                        var t = Date.now() - a;
                        t < this.knockbackDuration && (t = this.knockbackForce * (1 - t / this.knockbackDuration), 
                        player.x += Math.cos(e) * t * .5, player.y += Math.sin(e) * t * .5, 
                        requestAnimationFrame(s));
                    };
                    s(), this.lastAttackTime = r;
                }
            }
            h < this.detectionRange ? (this.isChasing = !0, this.targetDirection = Math.atan2(o, n)) : (this.isChasing = !1, 
            Math.random() < .01 && (this.targetDirection = Math.random() * Math.PI * 2));
            var l, r = (this.targetDirection - this.direction + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
            this.direction += .1 * r;
            let t = this.isChasing ? this.chaseSpeed : this.speed, e = this.x + Math.cos(this.direction) * t, a = this.y + Math.sin(this.direction) * t, s = e, i = a;
            for (l of [ ...trees, ...rocks, ...bushes, ...walls, ...spikes ]) {
                var c = e - l.x, d = a - l.y, p = Math.sqrt(c * c + d * d), y = this.hitboxRadius + l.hitboxRadius;
                p < y && (d = Math.atan2(d, c), c = y - p, s += Math.cos(d) * c, 
                i += Math.sin(d) * c);
            }
            this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, s)), 
            this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, i)), 
            this.swayAngle += this.swaySpeed;
        }
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y, a = (ctx.save(), ctx.translate(t, e), 
        this.isStanding ? 0 : Math.sin(this.swayAngle) * this.swayAmount), a = (ctx.rotate(this.direction - Math.PI / 2 + a), 
        ctx.drawImage(this.sprite, -this.radius, -this.radius, 2 * this.radius, 2 * this.radius), 
        ctx.restore(), e - this.radius - 10);
        ctx.fillStyle = "#ff0000", ctx.fillRect(t - 25, a, 50, 6), ctx.fillStyle = "#00ff00", 
        ctx.fillRect(t - 25, a, this.health / this.maxHealth * 50, 6);
    }
}

function spawnSingleWolf() {
    let t = !1, e, a;
    for (;!t; ) if (t = !0, !isValidSpawnLocation(e = Math.random() * (WORLD_WIDTH - 400) + 200, a = Math.random() * (WORLD_HEIGHT - 400) + 200)) {
        t = !1;
        continue;
    }
    return new Wolf(e, a);
}

class Cow {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 300, this.maxHealth = 300, this.radius = 40, 
        this.speed = 1.2, this.runSpeed = 2.8, this.direction = Math.random() * Math.PI * 2, 
        this.targetDirection = this.direction, this.isRunning = !1, this.lastDirectionChange = Date.now(), 
        this.directionChangeInterval = 3e3, this.isStanding = !1, this.sprite = new Image(), 
        this.sprite.src = "art/cow_1.png", this.swayAngle = 0, this.rotationSpeed = .1, 
        this.swaySpeed = .05, this.swayAmount = .1;
    }
    update() {
        var i = Date.now();
        if (this.isRunning) {
            this.isStanding = !1;
            let t = this.runSpeed, e = this.x + Math.cos(this.direction) * t, a = this.y + Math.sin(this.direction) * t, s = e, i = a;
            for (var n of [ ...trees, ...rocks, ...bushes, ...walls, ...spikes ]) {
                var o = e - n.x, h = a - n.y, r = Math.sqrt(o * o + h * h), n = this.radius + n.hitboxRadius;
                r < n && (h = Math.atan2(h, o), o = n - r, s += Math.cos(h) * o, 
                i += Math.sin(h) * o, this.direction += Math.PI / 4 * (.5 < Math.random() ? 1 : -1));
            }
            this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, s)), 
            this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, i));
        } else if (i - this.lastDirectionChange > this.directionChangeInterval && (this.isStanding = Math.random() < .3, 
        this.isStanding || (this.targetDirection = Math.random() * Math.PI * 2), 
        this.lastDirectionChange = i, this.directionChangeInterval = 2e3 + 2e3 * Math.random()), 
        !this.isStanding) {
            var l, i = (this.targetDirection - this.direction + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
            .01 < Math.abs(i) && (this.direction += i * this.rotationSpeed);
            let t = this.x + Math.cos(this.direction) * this.speed, e = this.y + Math.sin(this.direction) * this.speed, a = t, s = e;
            for (l of [ ...trees, ...rocks, ...bushes, ...walls ]) {
                var c = t - l.x, d = e - l.y, p = Math.sqrt(c * c + d * d), y = this.radius + l.hitboxRadius;
                p < y && (d = Math.atan2(d, c), c = y - p, a += Math.cos(d) * c, 
                s += Math.sin(d) * c, this.targetDirection = Math.random() * Math.PI * 2);
            }
            this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, a)), 
            this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, s));
        }
        this.swayAngle += this.swaySpeed;
    }
    hit(t, e) {
        var a = player.weapon.damage, a = (this.health -= a, new DamageText(this.x, this.y, a)), a = (damageTexts.push(a), 
        this.isRunning = !0, this.isStanding = !1, this.x - t), t = this.y - e;
        this.targetDirection = .4 * Math.random() - .2 + Math.atan2(t, a), this.rotationSpeed = .3, 
        setTimeout(() => {
            this.rotationSpeed = .1;
        }, 500), this.health <= 0 && (player.resources.apple += 100, player.resources.gold += 500, 
        -1 < (e = cows.indexOf(this))) && (player.incrementAgeProgress(30), cows.splice(e, 1), 
        t = spawnSingleCow(), cows.push(t)), setTimeout(() => {
            this.runSpeed = 2, setTimeout(() => {
                this.runSpeed = 1.6, setTimeout(() => {
                    this.isRunning = !1, this.runSpeed = 2.8;
                }, 1500);
            }, 1500);
        }, 1500);
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y, a = (ctx.save(), ctx.translate(t, e), 
        this.isStanding ? 0 : Math.sin(this.swayAngle) * this.swayAmount), a = (ctx.rotate(this.direction - Math.PI / 2 + a), 
        ctx.drawImage(this.sprite, -this.radius, -this.radius, 2 * this.radius, 2 * this.radius), 
        ctx.restore(), e - this.radius - 10);
        ctx.fillStyle = "#ff0000", ctx.fillRect(t - 25, a, 50, 6), ctx.fillStyle = "#00ff00", 
        ctx.fillRect(t - 25, a, this.health / this.maxHealth * 50, 6);
    }
}

function spawnSingleCow() {
    let t = !1, e, a;
    for (;!t; ) for (var s of (e = Math.random() * (WORLD_WIDTH - 400) + 200, a = Math.random() * (WORLD_HEIGHT - 400) + 200, 
    t = !0, [ ...trees, ...rocks, ...bushes, ...walls ])) {
        var i = e - s.x, s = a - s.y;
        if (Math.sqrt(i * i + s * s) < 100) {
            t = !1;
            break;
        }
    }
    return new Cow(e, a);
}

let cows = [], NUM_COWS = 10;

function spawnCows() {
    for (let t = 0; t < 10; t++) {
        let t = !1, e, a;
        for (;!t; ) for (var s of (e = Math.random() * (WORLD_WIDTH - 400) + 200, 
        a = Math.random() * (WORLD_HEIGHT - 400) + 200, t = !0, [ ...trees, ...rocks, ...bushes, ...walls ])) {
            var i = e - s.x, s = a - s.y;
            if (Math.sqrt(i * i + s * s) < 100) {
                t = !1;
                break;
            }
        }
        cows.push(new Cow(e, a));
    }
}

function isWallOverlapping(t, e) {
    for (var a of [ ...walls, ...boostPads, ...traps, ...spikes, ...trees, ...rocks, ...bushes ]) {
        var s = t - a.x, i = e - a.y;
        if (Math.sqrt(s * s + i * i) < 20 + (a.hitboxRadius || 40)) return !0;
    }
    for (var n of walls) {
        var o = t - n.x, n = e - n.y;
        if (Math.sqrt(o * o + n * n) < 20) return !0;
    }
    for (var h of boostPads) {
        var r = t - h.x, h = e - h.y;
        if (Math.sqrt(r * r + h * h) < 20) return !0;
    }
    for (var l of traps) {
        var c = t - l.x, l = e - l.y;
        if (Math.sqrt(c * c + l * l) < 20) return !0;
    }
    for (var d of spikes) {
        var p = t - d.x, d = e - d.y;
        if (Math.sqrt(p * p + d * d) < 20) return !0;
    }
    return !1;
}
let rfs = new Image ();
rfs.src = "art/hammer_1.png";
let resourceImages = {
    gold: new Image(),
    wood: new Image(),
    stone: new Image(),
    apple: new Image(),
    stoneWall: new Image(),
    stoneWallX: new Image(),
    trap: new Image(),
    boost: new Image(),
    cookie: new Image()
}, hammer = (resourceImages.cookie.src = "art/cookie_1.png", resourceImages.boost.src = "art/boost_1.png", 
resourceImages.trap.src = "art/trap_1.png", resourceImages.gold.src = "art/gold_1.png", 
resourceImages.wood.src = "art/wood_1.png", resourceImages.stone.src = "art/stone_1.png", 
resourceImages.apple.src = "art/apple_1.png", resourceImages.stoneWall.src = "art/stonewall_1.png", 
new Image()), sword = (hammer.src = "", new Image()), daggers = (sword.src = "art/sword_1.png", 
new Image()), stick = (daggers.src = "art/daggers_1.png", new Image()), katana = (stick.src = "art/stick_1.png", 
new Image());

katana.src = "art/katana_1.png";

class Weapon {
    constructor(t = "hammer") {
        var e = "hammer" === t ? WEAPONS[0] : "sword" === t ? WEAPONS[1] : "daggers" === t ? WEAPONS[2] : "stick" === t ? WEAPONS[3] : "katana" === t ? WEAPONS[4] : WEAPONS[0];
        this.type = t, this.sprite = {
            hammer: rfs,
            sword: sword,
            daggers: daggers,
            stick: stick,
            katana: katana
        }[t], this.gather = "stick" === t ? WEAPONS[3].gather : 1, this.width = e.width, 
        this.height = e.height, this.offsetX = e.xOff, this.reach = e.reach, this.damage = e.damage, 
        this.isAttacking = !1, this.attackAngleOffset = 0, this.swingProgress = 0, 
        this.lastAttackTime = 0, this.attackCooldown = e.attackSpeed;
    }
    startAttack() {
        var o = Date.now();
        if (!this.isAttacking && o - this.lastAttackTime >= this.attackCooldown) {
            this.isAttacking = !0, this.swingProgress = 0, this.lastAttackTime = o;
            let s = this.reach, i = player.x, n = player.y, t = player.x + Math.cos(player.weaponAngle) * player.weapon.reach, e = player.y + Math.sin(player.weaponAngle) * player.weapon.reach;
            for (var h of bosses) {
                var r = h.x - t, l = h.y - e;
                Math.sqrt(r * r + l * l) < h.width / 2 && h.takeDamage(player.weapon.damage);
            }
            boostPads.forEach(t => {
                var e = t.x - i, a = t.y - n;
                Math.sqrt(e * e + a * a) < s + t.hitboxRadius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && t.hit(this.type);
            }), spikes.forEach(t => {
                var e = t.x - i, a = t.y - n;
                Math.sqrt(e * e + a * a) < s + t.hitboxRadius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && t.hit(this.type);
            }), traps.forEach(t => {
                var e = t.x - i, a = t.y - n;
                Math.sqrt(e * e + a * a) < s + t.hitboxRadius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && t.hit(this.type);
            }), traps.forEach(t => {
                var e = t.x - i, a = t.y - n;
                this.type, Math.sqrt(e * e + a * a) < s + t.hitboxRadius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && t.hit(this.type);
            }), wolves.forEach(t => {
                var e = t.x - i, a = t.y - n;
                Math.sqrt(e * e + a * a) < s + t.hitboxRadius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && t.hit();
            }), cows.forEach(t => {
                var e = t.x - i, a = t.y - n;
                Math.sqrt(e * e + a * a) < s + t.radius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && t.hit(i, n);
            }), [ trees, rocks, bushes ].forEach(t => {
                t.forEach(t => {
                    var e = t.x - i, a = t.y - n;
                    Math.sqrt(e * e + a * a) < s + t.hitboxRadius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && ("stick" === this.type && (t instanceof Tree ? player.resources.wood += this.gather : t instanceof Rock ? player.resources.stone += this.gather : t instanceof Bush && (player.resources.apple += this.gather)), 
                    t.hit());
                });
            }), walls.forEach(t => {
                var e = t.x - i, a = t.y - n;
                Math.sqrt(e * e + a * a) < s + t.hitboxRadius && Math.abs(Math.atan2(a, e) - player.weaponAngle) < Math.PI / 2 && t.hit(player.weapon.type);
            });
            let a = () => {
                var t = "hammer" === this.type ? 0 : "sword" === this.type ? 1 : 2, t = WEAPONS[t].swingSpeed;
                this.swingProgress += t, this.swingProgress <= Math.PI / 2 ? this.attackAngleOffset = -Math.PI / 2 * this.swingProgress / (Math.PI / 2) : this.attackAngleOffset = -Math.PI / 2 * (1 - (this.swingProgress - Math.PI / 2) / (Math.PI / 2)), 
                this.swingProgress >= Math.PI ? (this.isAttacking = !1, this.attackAngleOffset = 0) : requestAnimationFrame(a);
            };
            a();
        }
    }
    draw(t, e, a, s) {
        t.save(), t.translate(e, a), t.rotate(s + this.attackAngleOffset), t.drawImage("stick" === this.type ? stick : this.sprite, -this.offsetX, -this.height / 2 + ("daggers" === this.type ? WEAPONS[2].yOff : "stick" === this.type ? WEAPONS[3].yOff : 0), this.width, this.height), 
        t.restore();
    }
}

document.getElementById("stoneWallButton").addEventListener("click", () => {
    var t, e;
    !player.hasChosenAge3Reward && player.hasChosenWeapon && (player.hasChosenAge3Reward = !0, 
    player.hasStoneWallUpgrade = !0, document.getElementById("cookieButton").style.display = "none", 
    document.getElementById("stoneWallButton").style.display = "none", (t = document.getElementById("slot4")).innerHTML = "", 
    (e = new Image()).src = "art/stonewall_1.png", e.style.width = "100%", e.style.height = "100%", 
    e.style.objectFit = "contain", t.appendChild(e));
});

class Trap {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 1400, this.maxHealth = 1400, this.width = 80, 
        this.height = 80, this.hitboxRadius = 15, this.damage = 30, this.lastTriggerTime = 0, 
        this.triggerCooldown = 1e3, this.isTriggered = !1, this.shakeX = 0, this.shakeY = 0, 
        this.shakeSpeed = .02, this.shakeDuration = 0, this.sprite = new Image(), 
        this.sprite.src = "art/trap_1.png", this.trappedEntities = new Set();
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + (0 < this.shakeDuration ? this.shakeX : 0), e + (0 < this.shakeDuration ? this.shakeY : 0)), 
        this.isTriggered && ctx.rotate(Math.PI / 4), ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height), 
        ctx.restore(), ctx.fillStyle = "#ff0000", ctx.fillRect(t - 25, e - this.height / 2 - 10, 50, 4), 
        ctx.fillStyle = "#00ff00", ctx.fillRect(t - 25, e - this.height / 2 - 10, this.health / this.maxHealth * 50, 4), 
        0 < this.shakeDuration && this.shakeDuration--;
    }
    hit(t) {
        var t = WEAPONS["hammer" === t ? 0 : "sword" === t ? 1 : "daggers" === t ? 2 : "stick" === t ? 3 : 0].damage;
        this.health -= t, this.shakeX = 5 * (Math.random() - .5), this.shakeY = 5 * (Math.random() - .5), 
        this.shakeDuration = 4, this.health <= 0 && (this.releaseTrappedEntities(), 
        -1 < (t = traps.indexOf(this))) && (traps.splice(t, 1), player.resources.wood += 15, 
        player.resources.stone += 15);
    }
    checkTrigger() {
        [ ...wolves, ...cows ].forEach(t => {
            var e = t.x - this.x, a = t.y - this.y;
            Math.sqrt(e * e + a * a) < this.hitboxRadius + t.hitboxRadius && !this.trappedEntities.has(t) && this.trapEntity(t);
        });
    }
    trapEntity(t) {
        this.trappedEntities.add(t), t.canMove = !1, this.isTriggered = !0;
    }
    releaseTrappedEntities() {
        this.trappedEntities.forEach(t => {
            t.canMove = !0;
        }), this.trappedEntities.clear();
    }
}

class BoostPad {
    constructor(t, e, a) {
        this.x = t, this.y = e, this.angle = a, this.health = 350, this.maxHealth = 350, 
        this.width = 80, this.height = 80, this.hitboxRadius = 30, this.lastKnockbackTime = 0, 
        this.knockbackCooldown = 500, this.boostForce = 15, this.shakeX = 0, this.shakeY = 0, 
        this.shakeSpeed = .02, this.shakeDuration = 0, this.sprite = new Image(), 
        this.sprite.src = "art/boost_1.png", this.boostedEntities = new Map();
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + (0 < this.shakeDuration ? this.shakeX : 0), e + (0 < this.shakeDuration ? this.shakeY : 0)), 
        ctx.rotate(this.angle + Math.PI / 2), ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height), 
        ctx.restore(), ctx.fillStyle = "#ff0000", ctx.fillRect(t - 25, e - this.height / 2 - 10, 50, 4), 
        ctx.fillStyle = "#00ff00", ctx.fillRect(t - 25, e - this.height / 2 - 10, this.health / this.maxHealth * 50, 4), 
        0 < this.shakeDuration && this.shakeDuration--;
    }
    hit(t) {
        var t = WEAPONS["hammer" === t ? 0 : "sword" === t ? 1 : "daggers" === t ? 2 : "stick" === t ? 3 : 0].damage;
        this.health -= t, this.shakeX = 5 * (Math.random() - .5), this.shakeY = 5 * (Math.random() - .5), 
        this.shakeDuration = 4, this.health <= 0 && -1 < (t = boostPads.indexOf(this)) && (boostPads.splice(t, 1), 
        player.resources.stone += 10, player.resources.wood += 2);
    }
    applyBoost(t) {
        var e, a = t.x - this.x, a = Math.atan2(t.y - this.y, a);
        Math.cos(this.angle) * Math.cos(a) + Math.sin(this.angle) * Math.sin(a) < 0 ? (t.x += 8 * Math.cos(this.angle), 
        t.y += 8 * Math.sin(this.angle), this.boostedEntities.set(t, {
            momentum: 8,
            direction: this.angle,
            timestamp: Date.now()
        })) : ((e = Date.now()) - this.lastKnockbackTime > this.knockbackCooldown && (t.x += 2 * Math.cos(a), 
        t.y += 2 * Math.sin(a), this.lastKnockbackTime = e), this.boostedEntities.set(t, {
            momentum: 3.5,
            direction: a,
            timestamp: Date.now()
        })), this.applyMomentumDecay(t);
    }
    applyMomentumDecay(e) {
        let a = this.boostedEntities.get(e);
        if (a) {
            let t = setInterval(() => {
                a.momentum *= .85, e.x += Math.cos(a.direction) * a.momentum, e.y += Math.sin(a.direction) * a.momentum, 
                a.momentum < .1 && (clearInterval(t), this.boostedEntities.delete(e));
            }, 50);
        }
    }
}

let traps = [];

traps.some(t => {
    var e = this.x - t.x, a = this.y - t.y;
    return Math.sqrt(e * e + a * a) < t.hitboxRadius + this.hitboxRadius;
}) && (this.speed = 0);

class Spike {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 375, this.maxHealth = 375, this.width = 60, 
        this.height = 60, this.hitboxRadius = 25, this.damage = 25, this.sprite = new Image(), 
        this.sprite.src = "art/spike_1.png", this.shakeX = 0, this.shakeY = 0, this.hitboxRadius = 25, 
        this.collisionRadius = 30, this.shakeDuration = 0;
    }
    checkCollision(t) {
        var e = t.x - this.x, a = t.y - this.y;
        return Math.sqrt(e * e + a * a) < this.collisionRadius + t.radius;
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + (0 < this.shakeDuration ? this.shakeX : 0), e + (0 < this.shakeDuration ? this.shakeY : 0)), 
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height), 
        ctx.restore(), ctx.fillStyle = "#ff0000", ctx.fillRect(t - 25, e - this.height / 2 - 10, 50, 4), 
        ctx.fillStyle = "#00ff00", ctx.fillRect(t - 25, e - this.height / 2 - 10, this.health / this.maxHealth * 50, 4), 
        0 < this.shakeDuration && this.shakeDuration--;
    }
    hit(t) {
        var t = WEAPONS["hammer" === t ? 0 : "sword" === t ? 1 : "daggers" === t ? 2 : "stick" === t ? 3 : "katana" === t ? 4 : 5].damage;
        this.health -= t, this.shakeX = 5 * (Math.random() - .5), this.shakeY = 5 * (Math.random() - .5), 
        this.shakeDuration = 4, this.health <= 0 && -1 < (t = spikes.indexOf(this)) && (spikes.splice(t, 1), 
        player.resources.wood += 10, player.resources.stone += 2);
    }
}

let spikes = [], MAX_SPIKES = 15;

resourceImages.spike = new Image(), resourceImages.spike.src = "art/spike_1.png";
resourceImages.stoneWallX.src = "art/stoneWallX.png"
class Arrow {
    constructor(t, e, a) {
        this.x = t, this.y = e, this.angle = a, this.speed = 15, this.distance = 0, 
        this.maxDistance = 300, this.damage = 25, this.sprite = new Image(), this.sprite.src = "art/arrow_1.png";
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed, this.y += Math.sin(this.angle) * this.speed, 
        this.distance += this.speed, [ ...wolves, ...cows, ...bosses ].forEach(t => {
            var e = t.x - this.x, a = t.y - this.y;
            Math.sqrt(e * e + a * a) < t.radius && (t.health -= this.damage, this.distance = this.maxDistance, 
            e = new DamageText(this.x, this.y, this.damage), damageTexts.push(e));
        });
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t, e), ctx.rotate(this.angle), ctx.drawImage(this.sprite, -25, -5, 50, 10), 
        ctx.restore();
    }
}

class StoneWall {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 2e3, this.maxHealth = 2e3, this.width = 80, 
        this.height = 80, this.hitboxRadius = 30, this.shakeAmount = 0, this.shakeX = 0, 
        this.shakeY = 0, this.shakeSpeed = .02, this.shakeDuration = 0;
    }
    hit(t) {
        var t = WEAPONS["hammer" === t ? 0 : "sword" === t ? 1 : "daggers" === t ? 2 : "stick" === t ? 3 : 0].damage;
        this.health -= t, this.shakeX = 7 * (Math.random() - .5), this.shakeY = 7 * (Math.random() - .5), 
        this.shakeDuration = 4, this.health <= 0 && -1 < (t = walls.indexOf(this)) && (walls.splice(t, 1), 
        player.resources.stone += 20);
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + (0 < this.shakeDuration ? this.shakeX : 0), e + (0 < this.shakeDuration ? this.shakeY : 0)), 
        ctx.drawImage(resourceImages.stoneWall, -this.width / 2, -this.height / 2, this.width, this.height), 
        ctx.restore(), ctx.fillStyle = "#ff0000", ctx.fillRect(t - 25, e - this.height / 2 - 10, 50, 4), 
        ctx.fillStyle = "#00ff00", ctx.fillRect(t - 25, e - this.height / 2 - 10, this.health / this.maxHealth * 50, 4), 
        0 < this.shakeDuration && this.shakeDuration--;
    }
}
class StoneWallX {
    constructor(t, e) {
        this.x = t, this.y = e, this.health = 3e3, this.maxHealth = 3e3, this.width = 190, 
        this.height = 110, this.hitboxRadius = 30, this.shakeAmount = 0, this.shakeX = 0, 
        this.shakeY = 0, this.shakeSpeed = .04, this.shakeDuration = 0;
    }
    hit(t) {
        var t = WEAPONS["hammer" === t ? 0 : "sword" === t ? 1 : "daggers" === t ? 2 : "stick" === t ? 3 : 0].damage;
        this.health -= t, this.shakeX = 7 * (Math.random() - .5), this.shakeY = 7 * (Math.random() - .5), 
        this.shakeDuration = 4, this.health <= 0 && -1 < (t = walls.indexOf(this)) && (walls.splice(t, 1), 
        player.resources.stone += 30);
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.save(), ctx.translate(t + (0 < this.shakeDuration ? this.shakeX : 0), e + (0 < this.shakeDuration ? this.shakeY : 0)), 
        ctx.drawImage(resourceImages.stoneWallX, -this.width / 2, -this.height / 2, this.width, this.height), 
        ctx.restore(), ctx.fillStyle = "#ff0000", ctx.fillRect(t - 25, e - this.height / 2 - 10, 50, 4), 
        ctx.fillStyle = "#00ff00", ctx.fillRect(t - 25, e - this.height / 2 - 10, this.health / this.maxHealth * 50, 4), 
        0 < this.shakeDuration && this.shakeDuration--;
    }
}
class StoneGiant {
    constructor(t, e) {
        this.x = t, this.y = e, this.sprite = new Image(), this.sprite.src = "assets/stone_giant.png", 
        this.sprite.onload = () => {}, this.width = 120, this.height = 180, this.health = 750, 
        this.maxHealth = 750, this.jumpCooldown = 3e3, this.lastJumpTime = 0, this.isJumping = !1, 
        this.ownedSkins = [], this.skinIndex = [ null, null ], this.jumpHeight = 0, 
        this.jumpTarget = {
            x: 0,
            y: 0
        }, this.targetPlayer = .6 < Math.random(), this.jumpSpeed = 15, this.detectionRange = 500, 
        this.rageLevel = 0, this.crackSpots = [], this.screenShake = {
            intensity: 0,
            duration: 0
        }, this.armAngle = 0, this.landingDamage = 80, this.poisonDamage = 50, this.poisonTicks = 5, 
        this.criticalMultipliers = [ {
            min: 5,
            max: 10
        }, {
            min: 10,
            max: 15
        }, {
            min: 15,
            max: 20
        } ];
    }
    updateRageLevel() {
        var t = this.health / this.maxHealth * 100;
        t <= 25 ? this.rageLevel = 3 : t <= 37.5 ? this.rageLevel = 2 : t <= 50 && (this.rageLevel = 1);
    }
    createCrack() {
        this.crackSpots.push({
            x: this.x,
            y: this.y,
            radius: 80,
            duration: 3e3,
            created: Date.now()
        });
    }
    updateCracks() {
        let e = Date.now();
        this.crackSpots = this.crackSpots.filter(t => e - t.created < t.duration);
    }
    triggerScreenShake() {
        this.screenShake = {
            intensity: 20,
            duration: 500,
            start: Date.now()
        };
    }
    applyScreenShake() {
        var t = player.x - this.x, e = player.y - this.y;
        !this.screenShake.duration || 800 < Math.sqrt(t * t + e * e) ? ctx.setTransform(1, 0, 0, 1, 0, 0) : (t = Date.now() - this.screenShake.start) < this.screenShake.duration && (e = 1 - t / this.screenShake.duration, 
        t = this.screenShake.intensity * e, ctx.translate(Math.random() * t - t / 2, Math.random() * t - t / 2));
    }
    calculateCriticalDamage() {
        var t;
        return 0 === this.rageLevel ? 0 : Math.floor(Math.random() * ((t = this.criticalMultipliers[this.rageLevel - 1]).max - t.min + 1)) + t.min;
    }
    applyPoisonEffect(t) {
        let e = this.poisonTicks, a = setInterval(() => {
            0 < e ? (t.health -= 10, e--) : clearInterval(a);
        }, 1e3);
    }
    update() {
        this.updateCracks();
        var t = Date.now();
        if (!this.isJumping && t - this.lastJumpTime > this.jumpCooldown && this.startJump(), 
        this.isJumping && this.handleJump(), this.isJumping) {
            var t = this.jumpTarget.x - this.x, e = this.jumpTarget.y - this.y, a = Math.sqrt(t * t + e * e);
            if (5 < a ? (this.x += t / a * (this.jumpSpeed / 2), this.y += e / a * (this.jumpSpeed / 2), 
            this.jumpHeight = 50 * Math.sin(a / 100)) : this.land(), this.health <= 0) {
                t = bosses.indexOf(this);
                if (-1 < t) return player.resources.wood += 500, player.resources.stone += 500, 
                player.resources.apple += 500, player.resources.gold += 1e3, bosses.splice(t, 1), 
                void setTimeout(() => {
                    spawnStoneGiant();
                }, 3e4);
            }
            this.updateRageLevel();
        }
    }
    takeDamage(t) {
        this.health -= t, this.shakeDuration = 5;
        t = new DamageText(this.x, this.y, t);
        damageTexts.push(t);
    }
    startJump() {
        var t, e;
        this.isJumping = !0, this.lastJumpTime = Date.now(), this.targetPlayer && this.isPlayerInRange() ? this.jumpTarget = {
            x: player.x,
            y: player.y
        } : this.jumpTarget = {
            x: this.x + Math.cos(t = Math.random() * Math.PI * 2) * (e = 200 * Math.random()),
            y: this.y + Math.sin(t) * e
        }, this.targetPlayer = .6 < Math.random();
    }
    handleJump() {
        var t = this.jumpTarget.x - this.x, e = this.jumpTarget.y - this.y, a = Math.sqrt(t * t + e * e);
        5 < a ? (this.x += t / a * this.jumpSpeed, this.y += e / a * this.jumpSpeed, 
        this.jumpHeight = 50 * Math.sin(a / 100)) : this.land();
    }
    dealDamage(t) {
        let e = this.landingDamage;
        0 < this.rageLevel && (e += this.calculateCriticalDamage()), soldierEq && (e *= .75), 
        t.health -= e, this.applyPoisonEffect(t);
        t = new DamageText(t.x, t.y, e);
        damageTexts.push(t);
    }
    land() {
        this.isJumping = !1, this.jumpHeight = 0, this.createCrack(), this.triggerScreenShake();
        var t = player.x - this.x, e = player.y - this.y;
        Math.sqrt(t * t + e * e) < 100 && this.dealDamage(player), this.updateRageLevel();
    }
    isPlayerInRange() {
        var t = player.x - this.x, e = player.y - this.y;
        return Math.sqrt(t * t + e * e) < this.detectionRange;
    }
    draw() {
        ctx.save(), this.applyScreenShake();
        let s = this.x - camera.x, i = this.y - camera.y;
        this.crackSpots.forEach(e => {
            var t = 1 - (Date.now() - e.created) / e.duration;
            ctx.beginPath(), ctx.strokeStyle = `rgba(139, 69, 19, ${t})`, ctx.lineWidth = 3;
            for (let t = 0; t < 8; t++) {
                var a = 2 * Math.PI * t / 8;
                ctx.moveTo(s, i), ctx.lineTo(s + Math.cos(a) * e.radius, i + Math.sin(a) * e.radius);
            }
            ctx.stroke();
        });
        var t = this.isJumping ? this.jumpHeight : 5 * Math.sin(Date.now() / 500), t = (ctx.drawImage(this.sprite, s - this.width / 2, i - this.height / 2 - t, this.width, this.height), 
        player.x - this.x), e = player.y - this.y;
        if (Math.sqrt(t * t + e * e) < this.detectionRange) {
            t = this.health / this.maxHealth;
            if (ctx.fillStyle = "rgba(0, 0, 0, 0.5)", ctx.fillRect(canvas.width / 2 - 200, 30, 400, 20), 
            ctx.fillStyle = 0 < this.rageLevel ? "#ff4444" : "#44ff44", ctx.fillRect(canvas.width / 2 - 200, 30, 400 * t, 20), 
            ctx.fillStyle = "#000000", ctx.font = "16px Nunito Bold", ctx.textAlign = "center", 
            ctx.fillText(`Stone Giant ${Math.floor(100 * t)}%`, canvas.width / 2, 25), 
            0 < this.rageLevel) {
                ctx.fillStyle = "#ff0000";
                for (let t = 0; t < this.rageLevel; t++) ctx.beginPath(), ctx.arc(canvas.width / 2 - 200 - 20 + 20 * t, 40, 5, 0, 2 * Math.PI), 
                ctx.fill();
            }
            ctx.restore();
        }
    }
}

class DesertScorpionManager {
    static instance = null;
    static spawn(t, e) {
        null == this.instance && (this.instance = new DesertScorpion(t, e), bosses.push(this.instance));
    }
    static removeInstance() {
        var t = bosses.indexOf(this.instance);
        -1 < t && bosses.splice(t, 1), this.instance = null;
    }
}

class Particle {
    constructor(t, e, a, s, i, n) {
        this.x = t, this.y = e, this.color = a, this.size = s, this.angle = i, this.speed = 3 * Math.random() + 2, 
        this.lifetime = n, this.created = Date.now();
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed, this.y += Math.sin(this.angle) * this.speed, 
        this.size *= .95;
    }
    draw() {
        var t = this.x - camera.x, e = this.y - camera.y;
        ctx.beginPath(), ctx.fillStyle = this.color, ctx.arc(t, e, this.size, 0, 2 * Math.PI), 
        ctx.fill();
    }
    isDead() {
        return Date.now() - this.created > this.lifetime;
    }
}

let emerged = 0;

class DesertScorpion {
    constructor(t, e) {
        this.id = DesertScorpion.generateUniqueId(), this.x = t, this.y = e, this.sprite = new Image(), 
        this.sprite.src = "assets/desert_scorpion.png", this.width = 150, this.height = 120, 
        this.health = 2e3, this.maxHealth = 2e3, this.attackCooldown = 2500, this.lastAttackTime = 0, 
        this.detectionRange = 130, this.speed = 2, this.angle = -Math.PI / 2, this.targetPosition = {
            x: 0,
            y: 0
        }, this.surfaceParticles = [], this.knockbackDistance = 50, this.deathHandled = !1, 
        this.stingerAttackCooldown = 5e3, this.lastStingerAttack = 0, this.chargeSpeed = 8, 
        this.isCharging = !1, this.poisonDuration = 5e3, this.poisonTickDamage = 10, 
        this.poisonDamage = 20, this.stingDamage = 35, this.whipDamage = 25, this.burrowState = "surface", 
        this.burrowCooldown = 5e3, this.burrowTimer = 0, this.sandstormActive = !1, 
        this.bossMode = !0, this.diggingAnimation = !1, this.bloodEffectTimer = 0, 
        this.tailWhipCooldown = 4e3, this.lastTailWhip = 0, this.isWhipping = !1, 
        this.whipAngle = 0, this.whipDuration = 500, this.whipKnockback = 35, this.whipSlowDuration = 2e3;
    }
    static generateUniqueId() {
        return `scorpion-${Date.now()}-` + Math.floor(1e3 * Math.random());
    }
    update() {
        var t = player.x - this.x, e = player.y - this.y, a = Math.sqrt(t * t + e * e);
        if (a <= this.detectionRange) {
            this.health <= 0 ? this.handleDeath() : (this.handleMovementAndAttack(), this.handleBurrow());
        }
    }
    handleDeath() {
        if (!this.deathHandled) {
            this.deathHandled = !0;
            for (let t = 0; t < 20; t++) particles.push(new Particle(this.x, this.y, "#8B4513", 4 * Math.random() + 2, Math.random() * Math.PI * 2, 1e3));
            DesertScorpionManager.removeInstance(), player.resources.wood += 500, 
            player.resources.stone += 500, player.resources.apple += 500, player.resources.gold += 1e3, 
            setTimeout(() => {
                null == DesertScorpionManager.instance && DesertScorpionManager.spawn(randomX, randomY);
            }, 3e4);
        }
    }
    handleMovementAndAttack() {
        var t = player.x - this.x, e = player.y - this.y, a = Math.sqrt(t * t + e * e);
        this.isWhipping ? this.angle += .2 : this.angle = Math.atan2(e, t) - Math.PI / 2, 
        this.angle = Math.atan2(e, t) - Math.PI / 2, a < this.detectionRange && "surface" === this.burrowState && (this.isCharging ? this.updateCharge() : (100 < a && (this.x += t / a * this.speed, 
        this.y += e / a * this.speed), (t = Date.now()) - this.lastAttackTime > this.attackCooldown && this.startChargeAttack(), 
        t - this.lastStingerAttack > this.stingerAttackCooldown && this.performStingerAttack(), 
        t - this.lastTailWhip > this.tailWhipCooldown && this.startTailWhip()));
    }
    startTailWhip() {
        this.isWhipping = !0, this.lastTailWhip = Date.now(), this.whipStartAngle = this.angle, 
        this.whipTargetAngle = this.angle + Math.PI, this.whipStartTime = Date.now();
        for (let t = 0; t < 12; t++) particles.push(new Particle(this.x, this.y, "#8B4513", 4, this.angle + Math.PI * t / 6, 500));
        var e = player.x - this.x, a = player.y - this.y;
        if (Math.sqrt(e * e + a * a) < 120) {
            let t = this.whipDamage;
            soldierEq && (t *= .75), player.health -= t;
            a = Math.atan2(a, e), e = this.whipKnockback / 10;
            player.vx || (player.vx = 0), player.vy || (player.vy = 0), player.vx = Math.cos(a) * e, 
            player.vy = Math.sin(a) * e, player.speed *= .7, setTimeout(() => {
                player.speed /= .7;
            }, this.whipSlowDuration);
        }
        setTimeout(() => {
            this.isWhipping = !1;
        }, this.whipDuration);
    }
    createDiggingEffect() {
        for (let t = 0; t < 20; t++) particles.push(new Particle(this.x, this.y, "rgba(194, 178, 128, 0.8)", 4 * Math.random() + 2, Math.random() * Math.PI * 2, 20));
    }
    updateSurfaceParticles() {
        Math.random() < .3 && this.surfaceParticles.push({
            x: this.x + 30 * (Math.random() - .5),
            y: this.y + 30 * (Math.random() - .5),
            life: 1
        }), this.surfaceParticles = this.surfaceParticles.filter(t => (t.life -= .05, 
        0 < t.life));
    }
    burrow() {
        this.burrowState = "underground", this.createDiggingEffect();
    }
    emerge() {
        this.burrowState = "surface", this.createDiggingEffect(), this.health += 100;
    }
    handleBurrow() {
        var t = Date.now();
        t - this.burrowTimer > this.burrowCooldown && (this.burrowState = "surface" === this.burrowState ? "underground" : "surface", 
        this.burrowTimer = t, this.diggingAnimation = !0, this.createDiggingEffect(), 
        setTimeout(() => {
            this.diggingAnimation = !1;
        }, 1e3)), "underground" === this.burrowState && (this.x += (Math.random() - .5) * this.speed, 
        this.y += (Math.random() - .5) * this.speed);
    }
    stingAttack() {
        var t = player.x - this.x, e = player.y - this.y;
        if (Math.sqrt(t * t + e * e) < 100) {
            let t = this.stingDamage;
            soldierEq && (t *= .75), player.health -= t, player.poisoned = !0, this.bloodEffectTimer = Date.now(), 
            setTimeout(() => {
                player.poisoned = !1;
            }, 3e3);
        }
    }
    sandstormAttack() {
        this.sandstormActive = !0, setTimeout(() => this.sandstormActive = !1, 2e3);
    }
    takeDamage(t) {
        "underground" !== this.burrowState && (this.health -= t, t = new DamageText(this.x, this.y, t), 
        damageTexts.push(t), 0 < this.health) && (this.flashRed = !0, setTimeout(() => this.flashRed = !1, 200));
    }
    draw() {
        var t, e, a;
        this.isWhipping && (t = (Date.now() - this.whipStartTime) / this.whipDuration, 
        this.angle = this.whipStartAngle + (this.whipTargetAngle - this.whipStartAngle) * Math.min(t, 1)), 
        this.deathHandled || (this.health <= 0 ? (this.handleDeath(), bosses = bosses.filter(t => t.id !== this.id)) : (t = this.x - camera.x, 
        e = this.y - camera.y, Date.now() - this.bloodEffectTimer < 1e3 && this.drawBloodEffect(), 
        ctx.save(), "surface" === this.burrowState && (ctx.fillStyle = "rgba(0, 0, 0, 0.2)", 
        ctx.beginPath(), ctx.ellipse(t, 10 + e, this.width / 2, this.height / 3, 0, 0, 2 * Math.PI), 
        ctx.fill(), ctx.translate(t, e), ctx.rotate(this.angle), ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height)), 
        this.isWhipping && (ctx.save(), ctx.translate(t, e), ctx.rotate(this.angle), 
        ctx.beginPath(), ctx.strokeStyle = "rgba(139, 69, 19, 0.6)", ctx.lineWidth = 8, 
        ctx.arc(0, 0, 80, Math.PI / 2, 1.5 * Math.PI), ctx.stroke(), ctx.restore()), 
        this.sandstormActive && (ctx.beginPath(), ctx.fillStyle = "rgba(194, 178, 128, 0.3)", 
        ctx.arc(t, e, 150, 0, 2 * Math.PI), ctx.fill()), ctx.restore(), "surface" === this.burrowState && (a = this.health / this.maxHealth, 
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)", ctx.fillRect(t - 50, e - this.height / 2 - 20, 100, 10), 
        ctx.fillStyle = "#ff4444", ctx.fillRect(t - 50, e - this.height / 2 - 20, 100 * a, 10)), 
        "underground" === this.burrowState && (this.updateSurfaceParticles(), t = player.x - this.x, 
        e = player.y - this.y, this.x += t / (a = Math.sqrt(t * t + e * e)) * this.speed * 2, 
        this.y += e / a * this.speed * 2), this.health < .3 * this.maxHealth && "surface" === this.burrowState && emerged <= 2 && (this.burrow(), 
        setTimeout(() => {
            emerged++, this.emerge(), this.performStingerAttack();
        }, 4e3)), "underground" === this.burrowState && this.surfaceParticles.forEach(t => {
            var e = t.x - camera.x, a = t.y - camera.y;
            ctx.beginPath(), ctx.fillStyle = `rgba(194, 178, 128, ${t.life})`, ctx.arc(e, a, 3, 0, 2 * Math.PI), 
            ctx.fill();
        }), player.isPoisoned && (ctx.fillStyle = "rgba(0, 255, 0, 0.2)", ctx.fillRect(0, 0, canvas.width, canvas.height))));
    }
    drawHealthBar(t, e) {
        var a = this.health / this.maxHealth;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)", ctx.fillRect(t - 200, e - this.height / 2 - 30, 400, 20), 
        ctx.fillStyle = "#ff4444", ctx.fillRect(t - 200, e - this.height / 2 - 30, 400 * a, 20), 
        ctx.fillStyle = "#000000", ctx.font = "16px Nunito Bold", ctx.textAlign = "center", 
        ctx.fillText(`Desert Scorpion ${Math.floor(100 * a)}%`, t, e - this.height / 2 - 35);
    }
    startChargeAttack() {
        this.isCharging = !0, this.targetPosition = {
            x: player.x,
            y: player.y
        }, this.lastAttackTime = Date.now();
    }
    performStingerAttack() {
        this.lastStingerAttack = Date.now();
        for (let t = 0; t < 8; t++) particles.push(new Particle(this.x, this.y, "#ff0000", 5, 2 * Math.PI * t / 8, 1e3));
        var t = player.x - this.x, e = player.y - this.y;
        if (Math.sqrt(t * t + e * e) < 150) {
            let t = 1.2 * this.stingDamage;
            soldierEq && (t *= .75), player.health -= t, this.applyPoison();
        }
    }
    applyPoison() {
        player.isPoisoned = !0;
        let t = setInterval(() => {
            player.isPoisoned && (player.health -= this.poisonTickDamage);
        }, 1e3);
        setTimeout(() => {
            player.isPoisoned = !1, clearInterval(t);
        }, this.poisonDuration);
    }
    updateCharge() {
        var t = this.targetPosition.x - this.x, e = this.targetPosition.y - this.y, a = Math.sqrt(t * t + e * e);
        5 < a ? (this.x += t / a * this.chargeSpeed, this.y += e / a * this.chargeSpeed, 
        Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2)) < 50 && (player.health -= this.stingDamage, 
        this.isCharging = !1)) : this.isCharging = !1;
    }
    drawBloodEffect() {
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)", ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let t = 0; t < 5; t++) {
            var e = Math.random() * canvas.width, a = 15 * Math.random() + 10;
            ctx.fillRect(e, 0, 2, a);
        }
    }
}
class IceDragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sprite = new Image();
        this.sprite.src = "assets/ice_dragon.png";
        this.width = 320; // Size adjusted for dragon design
        this.height = 180;
        this.health = 2000; // Dragon's health
        this.maxHealth = 1000;
        this.speed = 2; // Speed for roaming movement
        this.direction = Math.random() * 2 * Math.PI; // Random initial direction
        this.detectionRange = 700; // Range for detecting collisions with props
        this.rageLevel = 0;
        this.frostBreathCooldown = 3000;
        this.lastFrostBreath = 0;
        this.frostBreathRange = 600;
        this.frostBreathDamage = 80;
        this.frostBreathAngle = Math.PI / 4; // Cone width
        this.frostParticles = [];
        this.iceShards = []; // Effect upon taking damage
        this.screenShake = { intensity: 0, duration: 0 };
        this.landingDamage = 0;
        this.clawStrikeCooldown = 1200; // 1.2 second cooldown
        this.lastClawStrike = 0;
        this.clawStrikeDamage = 60;
        this.clawStrikeRange = 240;
        this.clawStrikeAngle = Math.PI * 0.5
        this.clawStrikeAnimation = {
            active: false,
            frame: 0,
            totalFrames: 6,
            duration: 300, // 300ms total animation
            startTime: 0
        }; // Forward cone attack
        
        // Make frost breath rarer
        this.frostBreathCooldown = 8000; // 8 seconds cooldown
        
        // Claw strike visual effect
        this.clawMarks = []; // No landing damage as it's a walking entity
    }
    performClawStrike() {
        const now = Date.now();
        if (now - this.lastClawStrike > this.clawStrikeCooldown) {
            this.lastClawStrike = now;
            this.clawStrikeAnimation.active = true;
            this.clawStrikeAnimation.startTime = now;
            this.clawStrikeAnimation.frame = 0;
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angleToPlayer = Math.atan2(dy, dx);
            
            if (distance < this.clawStrikeRange) {
                const angleDiff = Math.abs(normalizeAngle(this.direction - angleToPlayer));
                
                if (angleDiff < this.clawStrikeAngle/2) {
                    player.hit(this.clawStrikeDamage);
                    
                    // Add claw mark visual effect
                    this.clawMarks.push({
                        x: player.x,
                        y: player.y,
                        angle: angleToPlayer,
                        created: now,
                        duration: 500
                    });
                    
                    // Sharp knockback effect
                    const knockbackForce = 10;
                    const knockbackDuration = 200;
                    const startTime = now;
                    
                    const applyKnockback = () => {
                        const elapsed = Date.now() - startTime;
                        if (elapsed < knockbackDuration) {
                            const force = knockbackForce * (1 - elapsed/knockbackDuration);
                            player.x += Math.cos(angleToPlayer) * force;
                            player.y += Math.sin(angleToPlayer) * force;
                            requestAnimationFrame(applyKnockback);
                        }
                    };
                    applyKnockback();
                }
            }
        }
    }
    drawClawStrikeAnimation() {
        if (this.clawStrikeAnimation.active) {
            const now = Date.now();
            const elapsed = now - this.clawStrikeAnimation.startTime;
            const progress = elapsed / this.clawStrikeAnimation.duration;
            
            if (progress >= 1) {
                this.clawStrikeAnimation.active = false;
                return;
            }
    
            const screenX = this.x - camera.x;
            const screenY = this.y - camera.y;
            
            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(this.direction);
            
            // Create dramatic slash effect
            const slashProgress = Math.sin(progress * Math.PI);
            
            // Main slash effect
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 8;
            ctx.shadowColor = '#a8c7ff';
            ctx.shadowBlur = 15;
            
            // Create curved slash path
            const length = 120;
            const curve = 40;
            
            // Draw main slash
            ctx.beginPath();
            ctx.moveTo(-length/2 * slashProgress, -curve * slashProgress);
            ctx.quadraticCurveTo(
                0, 
                -curve * 1.5 * slashProgress, 
                length/2 * slashProgress, 
                -curve * slashProgress
            );
            ctx.stroke();
            
            // Add ice crystal particles along the slash
            for(let i = 0; i < 8; i++) {
                const particleProgress = i / 8;
                const x = (-length/2 + length * particleProgress) * slashProgress;
                const y = -curve * slashProgress * Math.sin(particleProgress * Math.PI);
                
                ctx.beginPath();
                ctx.fillStyle = `rgba(173, 216, 230, ${(1 - progress) * 0.8})`;
                ctx.arc(x, y, 3 + Math.random() * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add trailing effect
            ctx.strokeStyle = `rgba(168, 199, 255, ${(1 - progress) * 0.5})`;
            ctx.lineWidth = 12;
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    
    drawClawMarks() {
        const now = Date.now();
        this.clawMarks = this.clawMarks.filter(mark => {
            const age = now - mark.created;
            if (age < mark.duration) {
                const opacity = 1 - age / mark.duration;
                ctx.save();
                ctx.strokeStyle = `rgba(200, 220, 255, ${opacity})`;
                ctx.lineWidth = 3;
                
                // Draw three claw marks
                for (let i = -1; i <= 1; i++) {
                    const offset = i * 15;
                    ctx.beginPath();
                    const x = mark.x - camera.x + Math.cos(mark.angle + Math.PI/2) * offset;
                    const y = mark.y - camera.y + Math.sin(mark.angle + Math.PI/2) * offset;
                    ctx.moveTo(x, y);
                    ctx.lineTo(
                        x + Math.cos(mark.angle) * 30,
                        y + Math.sin(mark.angle) * 30
                    );
                    ctx.stroke();
                }
                ctx.restore();
                return true;
            }
            return false;
        });
    }
    performFrostBreath() {
        const now = Date.now();
    if (now - this.lastFrostBreath > this.frostBreathCooldown) {
        this.lastFrostBreath = now;
        
        // Increased particles for more intense effect
        for (let i = 0; i < 70; i++) {
            const angle = this.direction - this.frostBreathAngle/2 + Math.random() * this.frostBreathAngle;
            const speed = 8 + Math.random() * 5; // Faster particles
            const size = 3 + Math.random() * 8; // Varied particle sizes
            
            this.frostParticles.push({
                x: this.x,
                y: this.y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                life: 1,
                size: size,
                maxDistance: this.frostBreathRange,
                distanceTraveled: 0,
                opacity: 0.8 + Math.random() * 0.2,
                type: Math.random() > 0.7 ? 'crystal' : 'mist'
            });
            }

            // Check if player is in frost breath cone
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angleToPlayer = Math.atan2(dy, dx);
            const angleDiff = Math.abs(this.direction - angleToPlayer);

            if (distance < this.frostBreathRange && angleDiff < this.frostBreathAngle/2) {
                player.hit(this.frostBreathDamage);
                
                // Apply smooth knockback
                const knockbackForce = 15;
                const knockbackDuration = 1100;
                const startTime = Date.now();
                
                const applyKnockback = () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed < knockbackDuration) {
                        const force = knockbackForce * (1 - elapsed/knockbackDuration);
                        player.x += Math.cos(angleToPlayer) * force;
                        player.y += Math.sin(angleToPlayer) * force;
                        requestAnimationFrame(applyKnockback);
                    }
                };
                applyKnockback();

                // Increment freeze meter
                if (!player.freezeMeter) player.freezeMeter = 0;
                player.freezeMeter += 25; // Adjust this value to control how quickly the meter fills
            
                if (player.freezeMeter >= 100) {
                    player.isFrozen = true;
                    player.freezeMeter = 0;
                    
                    setTimeout(() => {
                        player.isFrozen = false;
                    }, 3000);
                }}
        }
    }
    // Method to simulate movement in a random direction
    roam() {
        if (Math.random() < 0.01) {
            this.direction = Math.random() * 2 * Math.PI;
        }
        
        const newX = this.x + Math.cos(this.direction) * this.speed;
        const newY = this.y + Math.sin(this.direction) * this.speed;
    
        // World boundary checks
        const boundaryPadding = this.width / 2;
        const boundedX = Math.max(boundaryPadding, Math.min(WORLD_WIDTH - boundaryPadding, newX));
        const boundedY = Math.max(boundaryPadding, Math.min(WORLD_HEIGHT - boundaryPadding, newY));
    
        // Check collisions with props or boundaries
        const collision = this.checkCollisions(boundedX, boundedY);
        this.x = collision.x;
        this.y = collision.y;
    
        // Change direction if hitting boundary
        if (boundedX !== newX || boundedY !== newY) {
            this.direction = Math.random() * 2 * Math.PI;
        }
    }
    
    checkCollisions(newX, newY) {
        let adjustedX = newX;
        let adjustedY = newY;
        
        // Add hitboxRadius property if not defined
        this.hitboxRadius = this.width / 2;
        
        const props = [...trees, ...rocks, ...bushes, ...walls, ...spikes, ...boostPads];
        
        for (const prop of props) {
            const dx = newX - prop.x;
            const dy = newY - prop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.hitboxRadius + prop.hitboxRadius;
            
            if (distance < minDistance) {
                const angle = Math.atan2(dy, dx);
                const pushDistance = minDistance - distance;
                
                adjustedX += Math.cos(angle) * pushDistance;
                adjustedY += Math.sin(angle) * pushDistance;
            }
        }
    
        return {
            x: adjustedX,
            y: adjustedY
        };
    }
    
    

    // Basic collision detection between IceDragon and a prop


    // Method to handle taking damage
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.onDeath();
        }
        this.triggerIceShardEffect();
    }

    // Method to handle visual effect when damaged
    triggerIceShardEffect() {
        this.iceShards.push({
            x: this.x,
            y: this.y,
            created: Date.now(),
            duration: 1000,
        });
    }

    // Method to update ice shards and remove expired ones
    updateIceShards() {
        const currentTime = Date.now();
        this.iceShards = this.iceShards.filter(
            shard => currentTime - shard.created < shard.duration
        );
    }

    // Death handling method
    onDeath() {
        // Logic for when IceDragon dies, e.g., removing from game
        console.log("The IceDragon has been defeated.");
    }

    // Method to draw IceDragon and any effects
    draw() {
        if (this.health <= 0) {

            return;
        }
        ctx.save();
        this.drawClawStrikeAnimation();

        this.applyScreenShake();
        const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;
        this.frostParticles.forEach(particle => {
            ctx.save();
            if (particle.type === 'crystal') {
                // Ice crystal effect
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.life * particle.opacity})`;
                ctx.strokeStyle = `rgba(173, 216, 230, ${particle.life * particle.opacity})`;
                ctx.lineWidth = 2;
                const x = particle.x - camera.x;
                const y = particle.y - camera.y;
                
                // Draw snowflake shape
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    ctx.moveTo(x, y);
                    ctx.lineTo(
                        x + Math.cos(angle) * particle.size * 2,
                        y + Math.sin(angle) * particle.size * 2
                    );
                }
                ctx.stroke();
                ctx.fill();
            } else {
                // Misty effect
                const gradient = ctx.createRadialGradient(
                    particle.x - camera.x, particle.y - camera.y, 0,
                    particle.x - camera.x, particle.y - camera.y, particle.size * 2
                );
                gradient.addColorStop(0, `rgba(200, 232, 255, ${particle.life * particle.opacity})`);
                gradient.addColorStop(1, `rgba(200, 232, 255, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particle.x - camera.x, particle.y - camera.y, particle.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // Draw freeze meter if player is being frozen
        if (player.freezeMeter > 0) {
            const screenX = player.x - camera.x;
            const screenY = player.y - camera.y;
            
            ctx.beginPath();
            ctx.strokeStyle = '#ADD8E6';
            ctx.lineWidth = 3;
            ctx.arc(screenX + 30, screenY - 30, 10, 0, Math.PI * 2 * (player.freezeMeter/100));
            ctx.stroke();
        }
        // Draw dragon sprite

        
        // Draw the sprite centered


        ctx.translate(screenX, screenY);
        ctx.rotate(this.direction - Math.PI/2);
        ctx.drawImage(
            this.sprite,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.restore();
        
        
        // Draw health bar
        const healthRatio = this.health / this.maxHealth;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(screenX - 50, screenY - 110, 100, 10);
        ctx.fillStyle = "#44ff44";
        ctx.fillRect(screenX - 50, screenY - 110, 100 * healthRatio, 10);

        // Draw ice shard effects
        this.iceShards.forEach(shard => {
            const opacity = 1 - (Date.now() - shard.created) / shard.duration;
            ctx.fillStyle = `rgba(173, 216, 230, ${opacity})`; // Light blue for ice
            ctx.beginPath();
            ctx.arc(shard.x - camera.x, shard.y - camera.y, 10, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // Method to apply screen shake effect (optional, can remove if unnecessary)
    applyScreenShake() {
        if (this.screenShake.duration > 0) {
            const elapsed = Date.now() - this.screenShake.start;
            if (elapsed < this.screenShake.duration) {
                const shakeAmount = this.screenShake.intensity * (1 - elapsed / this.screenShake.duration);
                ctx.translate(
                    Math.random() * shakeAmount - shakeAmount / 2,
                    Math.random() * shakeAmount - shakeAmount / 2
                );
            } else {
                this.screenShake = { intensity: 0, duration: 0 };
            }
        }
    }

    // Main update method called in game loop
    update() {
        if (!player.isFrozen) {
            // Update frost particles
            this.frostParticles = this.frostParticles.filter(particle => {
                particle.x += particle.dx;
                particle.y += particle.dy;
                particle.distanceTraveled += Math.sqrt(particle.dx * particle.dx + particle.dy * particle.dy);
                particle.life -= 0.02;
                return particle.life > 0 && particle.distanceTraveled < particle.maxDistance;
            });
    
            // Check distance to player for attacks
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.clawStrikeRange * 1.5) {
                this.direction = Math.atan2(dy, dx);
                this.performClawStrike(); // Main attack
                
                // Frost breath rarely
                if (Math.random() < 0.08) { // 8% chance when in range
                    this.performFrostBreath();
                }
            } else {
                this.roam();
            }
        }
        
        this.updateIceShards();
        this.checkCollisions(this.x, this.y);
    }
}    


let cookieButton = document.getElementById("cookieButton"), cookieInfo = document.getElementById("cookieInfo"), stoneWallButton = document.getElementById("stoneWallButton"), stoneWallInfo = document.getElementById("stoneWallInfo"), katanaButton = document.getElementById("katanaButton"), katanaInfo = document.getElementById("katanaInfo"), bowButton = document.getElementById("bowButton"), bowInfo = document.getElementById("bowInfo"), katanaB = (katanaButton.addEventListener("mouseover", () => {
    katanaInfo.style.display = "block";
}), katanaButton.addEventListener("mouseout", () => {
    katanaInfo.style.display = "none";
}), bowButton.addEventListener("mouseover", () => {
    bowInfo.style.display = "block";
}), bowButton.addEventListener("mouseout", () => {
    bowInfo.style.display = "none";
}), cookieButton.addEventListener("mouseover", () => {
    cookieInfo.style.display = "block";
}), cookieButton.addEventListener("mouseout", () => {
    cookieInfo.style.display = "none";
}), stoneWallButton.addEventListener("mouseover", () => {
    stoneWallInfo.style.display = "block";
}), stoneWallButton.addEventListener("mouseout", () => {
    stoneWallInfo.style.display = "none";
}), document.getElementById("bowButton").addEventListener("click", () => {
    if (5 <= player.age && player.hasChosenAge4Reward) {
        var e = document.querySelectorAll(".toolbar-slot");
        for (let t = e.length - 1; 2 < t; t--) e[t].innerHTML = e[t - 1].innerHTML;
        var t = document.getElementById("slot2");
        t.innerHTML = "";
        new Image().src = "art/arrow_1.png";
        var a = new Image();
        a.src = "art/bow_1.png", a.style.width = "100%", a.style.height = "100%", 
        a.style.objectFit = "contain", t.appendChild(a), player.secondaryWeapon = "bow", 
        document.getElementById("bowButton").style.display = "none", document.getElementById("katanaButton").style.display = "none";
    }
}), !1), bowB = !1, shopItems = (document.getElementById("katanaButton").addEventListener("click", () => {
    var t, e;
    5 <= player.age && player.hasChosenAge4Reward && "sword" === player.weapon.type && !katanaB && (katanaB = !0, 
    t = new Weapon("katana"), player.weapon = t, (t = document.getElementById("slot1")).innerHTML = "", 
    (e = new Image()).src = "art/katana_1.png", e.style.width = "100%", e.style.height = "100%", 
    e.style.objectFit = "contain", t.appendChild(e), document.getElementById("katanaButton").style.display = "none", 
    document.getElementById("bowButton").style.display = "none", camera.x = player.x - canvas.width / 2, 
    camera.y = player.y - canvas.height / 2);
}), document.getElementById("trapButton").addEventListener("click", () => {
    var t, e;
    4 <= player.age && !player.hasChosenAge4Reward && (player.hasChosenAge4Reward = !0, 
    player.hasTrapUpgrade = !0, document.getElementById("trapButton").style.display = "none", 
    document.getElementById("boostButton").style.display = "none", t = player.hasStoneWallUpgrade ? "slot5" : "slot4", 
    (t = document.getElementById(t)).innerHTML = "", (e = new Image()).src = "art/trap_1.png", 
    e.style.width = "100%", e.style.height = "100%", e.style.objectFit = "contain", 
    t.appendChild(e), updateAgeSelectionText());
}), document.getElementById("boostButton").addEventListener("click", () => {
    var t, e;
    4 <= player.age && !player.hasChosenAge4Reward && (player.hasChosenAge4Reward = !0, 
    player.hasBoostUpgrade = !0, document.getElementById("trapButton").style.display = "none", 
    document.getElementById("boostButton").style.display = "none", t = player.hasStoneWallUpgrade ? "slot5" : "slot4", 
    (t = document.getElementById(t)).innerHTML = "", (e = new Image()).src = "art/boost_1.png", 
    e.style.width = "100%", e.style.height = "100%", e.style.objectFit = "contain", 
    t.appendChild(e), updateAgeSelectionText());
}), document.getElementById("battleModeBtn").addEventListener("click", function() {
    this.classList.toggle("active"), this.querySelector(".mode-status").textContent = this.classList.contains("active") ? "ON" : "OFF", 
    window.battleMode = this.classList.contains("active");
}), document.getElementById("enterGame").addEventListener("click", () => {
player.freezeMeter = 0,window.battleMode && (player.age = 20, player.hasChosenWeapon = !0, player.hasChosenAge3Reward = !0, 
    player.hasChosenAge4Reward = !0, player.hasStoneWallUpgrade = !0, player.hasTrapUpgrade = !0, 
    player.hasBoostUpgrade = !0, player.hasCookieUpgrade = !0, player.weapon = new Weapon("katana"), 
    player.secondaryWeapon = "bow", Object.entries({
        slot1: {
            src: "art/katana_1.png"
        },
        slot2: {
            src: "art/bow_1.png"
        },
        slot3: {
            src: "art/cookie_1.png"
        },
        slot4: {
            src: "art/spike_1.png"
        },
        slot5: {
            src: "art/stonewall_1.png"
        },
        slot6: {
            src: "art/trap_1.png"
        },
        slot7: {
            src: "art/boost_1.png"
        }
    }).forEach(([ t, e ]) => {
        var t = document.getElementById(t), a = (t.innerHTML = "", new Image());
        a.src = e.src, a.style.width = "100%", a.style.height = "100%", a.style.objectFit = "contain", 
        t.appendChild(a);
    }));
}), {
    snow_hat: {
        owned: !1,
        equipped: !1,
        price: 1e3
    },
    soldier_hat: {
        owned: !1,
        equipped: !1,
        price: 4e3
    },
    speed_hat: {
        owned: !1,
        equipped: !1,
        price: 6e3
    }
}), walls = [], SKINS = (document.addEventListener("keydown", t => {
    "3" !== t.key || window.battleMode || (player.heldItem = "spike" === player.heldItem ? "weapon" : "spike");
}), document.addEventListener("keydown", t => {
    "4" === t.key && (player.hasStoneWallUpgrade ? player.heldItem = "stoneWall" === player.heldItem ? "weapon" : "stoneWall" : player.hasTrapUpgrade ? player.heldItem = "trap" === player.heldItem ? "weapon" : "trap" : player.hasBoostUpgrade && (player.heldItem = "boost" === player.heldItem ? "weapon" : "boost")), 
    "f" === t.key && player.hasStoneWallUpgrade && (player.hasTrapUpgrade ? player.heldItem = "trap" === player.heldItem ? "weapon" : "trap" : player.hasBoostUpgrade && (player.heldItem = "boost" === player.heldItem ? "weapon" : "boost"));
}), [ {
    id: 4,
    type: "hat",
    slot: 0,
    src: "snow_hat"
}, {
    id: 5,
    type: "hat",
    slot: 0,
    src: "soldier_hat"
}, {
    id: 6,
    type: "hat",
    slot: 0,
    src: "speed_hat"
} ]), WEAPONS = [ {
    id: 1,
    type: "primary",
    age: 1,
    name: "hammer",
    desc: "basic gathering tool",
    src: "hammer_1",
    width: 45,
    height: 70,
    xOff: 12,
    reach: 60,
    swingSpeed: .15,
    damage: 25,
    speed: 2.6,
    attackSpeed: 470,
    gather: 1
}, {
    id: 2,
    type: "primary",
    age: 2,
    name: "sword",
    desc: "increased damage and range",
    src: "sword_1",
    width: 55,
    height: 80,
    xOff: 15,
    reach: 70,
    swingSpeed: .15,
    damage: 35,
    speed: 2.4,
    attackSpeed: 470,
    gather: 1
}, {
    id: 3,
    type: "primary",
    age: 2,
    name: "daggers",
    desc: "fast attacks and movement",
    src: "daggers_1",
    width: 40,
    height: 60,
    xOff: 1,
    yOff: -17,
    reach: 70,
    swingSpeed: .25,
    damage: 29,
    speed: 3,
    attackSpeed: 300,
    gather: 1
}, {
    id: 4,
    type: "primary",
    age: 2,
    name: "stick",
    desc: "great for gathering, weak for combat",
    src: "stick_1",
    width: 40,
    height: 60,
    xOff: 8,
    yOff: 0,
    reach: 60,
    swingSpeed: .2,
    damage: 1,
    speed: 2.6,
    attackSpeed: 400,
    gather: 7
}, {
    id: 6,
    type: "primary",
    age: 5,
    name: "katana",
    desc: "deadly blade with extended reach",
    src: "katana_1",
    width: 60,
    height: 85,
    xOff: 15,
    reach: 80,
    swingSpeed: .15,
    damage: 45,
    speed: 2.6,
    attackSpeed: 440,
    gather: 1
}, {
    id: 7,
    type: "secondary",
    age: 5,
    name: "bow",
    desc: "ranged weapon",
    src: "bow_1",
    width: 50,
    height: 70,
    xOff: 10,
    reach: 300,
    damage: 25,
    attackSpeed: 1e3
} ];

function updateWeaponButtonPositions() {
    var t = document.getElementById("swordButton"), e = document.getElementById("daggersButton"), a = document.getElementById("stickButton");
    t.style.left = "40%", t.style.top = "20px", e.style.left = "47%", e.style.top = "20px", 
    a.style.left = "54%", a.style.top = "20px";
}

2 === this.age && (document.getElementById("swordButton").style.display = "block", 
document.getElementById("daggersButton").style.display = "block", document.getElementById("stickButton").style.display = "block", 
updateWeaponButtonPositions());

let daggersButton = document.getElementById("daggersButton"), daggersInfo = document.getElementById("daggersInfo"), stickButton = (daggersButton.addEventListener("mouseover", () => {
    daggersInfo.style.display = "block";
}), daggersButton.addEventListener("mouseout", () => {
    daggersInfo.style.display = "none";
}), document.getElementById("stickButton")), stickInfo = document.getElementById("stickInfo"), swordButton = (stickButton.addEventListener("mouseover", () => {
    stickInfo.style.display = "block";
}), stickButton.addEventListener("mouseout", () => {
    stickInfo.style.display = "none";
}), document.getElementById("swordButton")), swordInfo = document.getElementById("swordInfo");

function drawResourceUI() {
    let t = canvas.width - 1270, e = canvas.height - 270, a = "rgba(0, 0, 0, 0.1)", s = (ctx.fillStyle = a, 
    ctx.roundRect(t - 4, e - 4, 73, 48, 5), ctx.fill(), ctx.drawImage(resourceImages.gold, t, e, 40, 40), 
    ctx.fillStyle = "#000", ctx.font = "20px Nunito Bold", ctx.textAlign = "right", ctx.fillText(player.resources.gold.toString(), 40 + t + 25, 40 + e - 10), 
    canvas.width - 90), i = canvas.height - 44;
    [ "wood", "stone", "apple" ].forEach((t, e) => {
        e = i - 60 * e;
        ctx.fillStyle = a, ctx.roundRect(s - 4, e - 4, 73, 48, 5), ctx.fill(), ctx.drawImage(resourceImages[t], s, e, 40, 40), 
        ctx.fillStyle = "#000", ctx.font = "20px Nunito Bold", ctx.textAlign = "right", 
        ctx.fillText(player.resources[t].toString(), 40 + s + 25, 40 + e - 10);
    });
}

function drawRiver() {
    ctx.fillStyle = "#2389da", ctx.beginPath();
    for (let t = 0; t < WORLD_WIDTH; t += 5) {
        var e = RIVER_Y_OFFSET + Math.sin(t * RIVER_CURVE_FREQUENCY) * RIVER_CURVE_AMPLITUDE, a = t - camera.x, e = e - camera.y;
        0 === t ? ctx.moveTo(a, e) : ctx.lineTo(a, e);
    }
    ctx.lineWidth = RIVER_WIDTH, ctx.strokeStyle = "#2389da", ctx.stroke(), ctx.lineWidth = RIVER_WIDTH - 20, 
    ctx.strokeStyle = "#3498db", ctx.stroke();
}

function isInRiver(t, e) {
    return Math.abs(e - (RIVER_Y_OFFSET + Math.sin(t * RIVER_CURVE_FREQUENCY) * RIVER_CURVE_AMPLITUDE)) < RIVER_WIDTH / 2;
}

function isInDesertBiome(t, e) {
    return e > .7 * WORLD_HEIGHT;
}

function isInSnowBiome(t, e) {
    return e < .3 * WORLD_HEIGHT;
}

function drawBiomes() {
    ctx.fillStyle = "#e8f0ff", ctx.fillRect(-camera.x, -camera.y, WORLD_WIDTH, .3 * WORLD_HEIGHT);
    var t = .7 * WORLD_HEIGHT;
    ctx.fillStyle = "#e3c78a", ctx.fillRect(-camera.x, t - camera.y, WORLD_WIDTH, WORLD_HEIGHT - t);
}

swordButton.addEventListener("mouseover", () => {
    swordInfo.style.display = "block";
}), swordButton.addEventListener("mouseout", () => {
    swordInfo.style.display = "none";
}), document.getElementById("swordButton").addEventListener("click", () => {
    2 <= player.age && !player.hasChosenWeapon && (updateAgeSelectionText(), player.weapon = new Weapon("sword"), 
    player.speed = WEAPONS[1].speed, player.hasChosenWeapon = !0, document.getElementById("swordButton").style.display = "none", 
    document.getElementById("daggersButton").style.display = "none", document.getElementById("stickButton").style.display = "none", 
    updateToolbar(), player.showAgeChoices());
}), document.getElementById("daggersButton").addEventListener("click", () => {
    2 <= player.age && !player.hasChosenWeapon && (player.weapon = new Weapon("daggers"), 
    player.speed = WEAPONS[2].speed, player.hasChosenWeapon = !0, document.getElementById("swordButton").style.display = "none", 
    document.getElementById("daggersButton").style.display = "none", document.getElementById("stickButton").style.display = "none", 
    updateToolbar(), player.showAgeChoices());
}), document.getElementById("stickButton").addEventListener("click", () => {
    2 <= player.age && !player.hasChosenWeapon && (player.weapon = new Weapon("stick"), 
    player.speed = WEAPONS[3].speed, player.hasChosenWeapon = !0, document.getElementById("swordButton").style.display = "none", 
    document.getElementById("daggersButton").style.display = "none", document.getElementById("stickButton").style.display = "none", 
    updateToolbar(), player.showAgeChoices());
}), this.hasChosenAge3Reward = !1, document.getElementById("cookieButton").style.display = "none", 
document.getElementById("stoneWallButton").style.display = "none", document.getElementById("cookieButton").addEventListener("click", () => {
    var t, e;
    3 <= player.age && !player.hasChosenAge3Reward && player.hasChosenWeapon && (player.hasChosenAge3Reward = !0, 
    player.hasCookieUpgrade = !0, document.getElementById("cookieButton").style.display = "none", 
    document.getElementById("stoneWallButton").style.display = "none", player.showAgeChoices(), 
    updateAgeSelectionText(), (t = document.getElementById("slot2")).innerHTML = "", 
    (e = new Image()).src = "art/cookie_1.png", e.style.width = "100%", e.style.height = "100%", 
    e.style.objectFit = "contain", t.appendChild(e), "apple" === player.heldItem) && (player.heldItem = "cookie");
}), document.getElementById("stoneWallButton").addEventListener("click", () => {
    3 <= player.age && !player.hasChosenAge3Reward && player.hasChosenWeapon && (player.hasChosenAge3Reward = !0, 
    document.getElementById("cookieButton").style.display = "none", document.getElementById("stoneWallButton").style.display = "none", 
    updateToolbar(), player.showAgeChoices());
}), setTimeout(() => {
    player.ageProgress += 100, player.moofoll("res", 1e4);
}, 1e3);

let minimap = document.getElementById("minimap"), minimapCtx = minimap.getContext("2d");

function drawMinimap() {
    let e = minimap.width / WORLD_WIDTH;
    minimapCtx.fillStyle = "#b6db66", minimapCtx.fillRect(0, 0, minimap.width, minimap.height), 
    minimapCtx.fillStyle = "#e8f0ff", minimapCtx.fillRect(0, 0, minimap.width, .3 * WORLD_HEIGHT * e), 
    minimapCtx.fillStyle = "#e3c78a", minimapCtx.fillRect(0, .7 * WORLD_HEIGHT * e, minimap.width, .3 * WORLD_HEIGHT * e), 
    minimapCtx.strokeStyle = "#2389da", minimapCtx.lineWidth = RIVER_WIDTH * e, 
    minimapCtx.beginPath();
    for (let t = 0; t < WORLD_WIDTH; t += 50) {
        var a = RIVER_Y_OFFSET + Math.sin(t * RIVER_CURVE_FREQUENCY) * RIVER_CURVE_AMPLITUDE, s = t * e, a = a * e;
        0 === t ? minimapCtx.moveTo(s, a) : minimapCtx.lineTo(s, a);
    }
    minimapCtx.stroke(), trees.forEach(t => {
        minimapCtx.beginPath(), minimapCtx.fillStyle = "#2D5A27", minimapCtx.arc(t.x * e, t.y * e, 2, 0, 2 * Math.PI), 
        minimapCtx.fill();
    }), rocks.forEach(t => {
        minimapCtx.beginPath(), minimapCtx.fillStyle = "#808080", minimapCtx.arc(t.x * e, t.y * e, 2, 0, 2 * Math.PI), 
        minimapCtx.fill();
    }), bushes.forEach(t => {
        minimapCtx.beginPath(), minimapCtx.fillStyle = "#3A7A34", minimapCtx.arc(t.x * e, t.y * e, 1.5, 0, 2 * Math.PI), 
        minimapCtx.fill();
    }), minimapCtx.beginPath(), minimapCtx.fillStyle = "#ff0000", minimapCtx.arc(player.x * e, player.y * e, 3, 0, 2 * Math.PI), 
    minimapCtx.fill(), minimapCtx.strokeStyle = "#000", minimapCtx.lineWidth = 1, 
    minimapCtx.strokeRect(camera.x * e, camera.y * e, canvas.width * e, canvas.height * e);
}

minimap.width = 200, minimap.height = 200;

let bushes = [], NUM_BUSHES = 40, MIN_BUSH_DISTANCE = 200;

function spawnBushes() {
    for (let t = 0; t < 40; t++) {
        let t = !1, e, a;
        for (;!t; ) if (t = !0, isValidSpawnLocation(e = Math.random() * (WORLD_WIDTH - 400) + 200, a = Math.random() * (WORLD_HEIGHT - 400) + 200)) {
            for (var s of trees) {
                var i = e - s.x, s = a - s.y;
                if (Math.sqrt(i * i + s * s) < 250) {
                    t = !1;
                    break;
                }
            }
            for (var n of bushes) {
                var o = e - n.x, n = a - n.y;
                if (Math.sqrt(o * o + n * n) < 250) {
                    t = !1;
                    break;
                }
            }
        } else t = !1;
        bushes.push(new Bush(e, a));
    }
}

function drawAgeBar() {
    var t = canvas.width / 2 - 100, e = canvas.height - 100, a = (ctx.fillStyle = "#000", 
    ctx.font = "14px Nunito Bold", ctx.textAlign = "center", ctx.fillText("AGE " + player.age, canvas.width / 2, e - 5), 
    ctx.beginPath(), ctx.roundRect(t, e, 200, 6, 3), ctx.strokeStyle = "#000", ctx.lineWidth = 2, 
    ctx.stroke(), player.ageRequirement * Math.pow(1.2, player.age - 1)), a = player.ageProgress / a;
    ctx.beginPath(), ctx.roundRect(t, e, 200 * a, 6, 3), ctx.fillStyle = "#4CAF50", 
    ctx.fill();
}

function updateToolbar() {
    var t = document.getElementById("slot1"), e = (t.innerHTML = "", new Image());
    e.src = `art/${player.weapon.type}_1.png`, e.style.width = "100%", e.style.height = "100%", 
    e.style.objectFit = "contain", t.appendChild(e), player.hasStoneWallUpgrade && ((t = document.getElementById("slot4")).innerHTML = "", 
    (e = new Image()).src = "art/stonewall_1.png", e.style.width = "100%", e.style.height = "100%", 
    e.style.objectFit = "contain", t.appendChild(e));
}
// Ensure the player's weapons array is initialized

function initializeToolbar() {
    var t = document.getElementById("slot1"), e = (t.innerHTML = "", new Image()), t = (e.src = "art/hammer_1.png", 
    e.style.width = "100%", e.style.height = "100%", e.style.objectFit = "contain", 
    t.appendChild(e), document.getElementById("slot2")), e = (t.innerHTML = "", 
    new Image()), t = (e.src = "art/apple_1.png", e.style.width = "100%", e.style.height = "100%", 
    e.style.objectFit = "contain", t.appendChild(e), document.getElementById("slot3")), e = (t.innerHTML = "", 
    new Image());
    e.src = "art/spike_1.png", e.style.width = "100%", e.style.height = "100%", 
    e.style.objectFit = "contain", t.appendChild(e);
}
// Ensure the player's weapons array is initialized
function initializeWeapons() {
    if (!player.weapons) {
        player.weapons = [];
    }
}
function addMusketToInventory() {
    initializeWeapons(); // Ensure weapons array is initialized

    // Check if the musket is already in the inventory
    const hasMusket = player.weapons.some(w => w.type === "musket");
    if (!hasMusket) {
        const musket = new Musket();
        player.weapons.push(musket);
        console.log("Musket added to inventory!");
    }
}
function switchToMusket() {
    initializeWeapons(); // Ensure weapons array is initialized

    // Find the musket in the player's inventory
    const musket = player.weapons.find(w => w.type === "musket");
    if (musket) {
        player.weapon = musket;
        console.log("Switched to musket!");
    } else {
        console.log("Musket not found in inventory.");
    }
}
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addMusketToInventory();
    }, 1000); // Delay to ensure player object is loaded
});

initializeToolbar();

let rocks = [], NUM_ROCKS = 30, MIN_ROCK_DISTANCE = 250;

function isValidSpawnLocation(t, e) {
    return Math.abs(e - (RIVER_Y_OFFSET + Math.sin(t * RIVER_CURVE_FREQUENCY) * RIVER_CURVE_AMPLITUDE)) > RIVER_WIDTH / 2;
}

function spawnRocks() {
    for (let t = 0; t < 30; t++) {
        let t = !1, e, a;
        for (;!t; ) {
            for (var s of (e = Math.random() * (WORLD_WIDTH - 400) + 200, a = Math.random() * (WORLD_HEIGHT - 400) + 200, 
            t = !0, trees)) {
                var i = e - s.x, s = a - s.y;
                if (Math.sqrt(i * i + s * s) < 250) {
                    t = !1;
                    break;
                }
            }
            if (t) for (var n of rocks) {
                var o = e - n.x, n = a - n.y;
                if (Math.sqrt(o * o + n * n) < 250) {
                    t = !1;
                    break;
                }
            }
        }
        rocks.push(new Rock(e, a));
    }
}
// Function to place an item (e.g., spike, trap, wall)
function placeItem(itemType) {
    let x = player.x + 50 * Math.cos(player.weaponAngle);
    let y = player.y + 50 * Math.sin(player.weaponAngle);

    switch (itemType) {
        case "spike":
            if (player.resources.wood >= 20 && player.resources.stone >= 5 && spikes.length < MAX_SPIKES) {
                if (!isWallOverlapping(x, y)) {
                    spikes.push(new Spike(x, y));
                    player.resources.wood -= 20;
                    player.resources.stone -= 5;
                    console.log("Spike placed!");
                }
            }
            break;
        case "stoneWall":
            if (player.resources.stone >= 20) {
                if (!isWallOverlapping(x, y)) {
                    walls.push(new StoneWall(x, y));
                    player.resources.stone -= 20;
                    console.log("Stone wall placed!");
                }
            }
            break;
        case "trap":
            if (player.resources.wood >= 30 && player.resources.stone >= 30) {
                if (!isWallOverlapping(x, y)) {
                    traps.push(new Trap(x, y));
                    player.resources.wood -= 30;
                    player.resources.stone -= 30;
                    console.log("Trap placed!");
                }
            }
            break;
        default:
            console.log(`Unknown item type: ${itemType}`);
    }
}

// Function to switch held item
function switchItem(item) {
    switch (item) {
        case "spike":
            player.heldItem = "spike";
            break;
        case "stoneWall":
            player.heldItem = "stoneWall";
            break;
        case "trap":
            player.heldItem = "trap";
            break;
        case "weapon":
            player.heldItem = "weapon";
            break;
        case "bow":
            player.heldItem = "bow";
            break;
        default:
            console.log(`Unknown item: ${item}`);
    }
    console.log(`Switched to item: ${item}`);
}

// Function to attack with current weapon
function attack() {
    if (player.weapon) {
        player.weapon.startAttack();
        console.log("Attacking with weapon!");
    }
}

// Function to heal using apples or cookies
function heal() {
    if (player.heldItem === "apple" || player.heldItem === "cookie") {
        player.healWithApple();
        console.log("Healed using item!");
    }
}
class Musket {
    constructor() {
        this.type = "musket";
        this.reach = 400; // Long range for the musket
        this.damage = 100; // High damage, enough for insta-kills
        this.reloadTime = 100; // Time required to reload (in ticks)
        this.cooldown = 0;
        this.bulletSpeed = 15; // Speed of the musket bullet
    }

    // Method to fire the musket
    fire(angle) {
        if (this.cooldown > 0) {
            console.log("Musket is reloading...");
            return;
        }

        console.log("Firing musket!");
        const bullet = new MusketBullet(player.x, player.y, angle);
        bullets.push(bullet);

        // Apply cooldown after firing
        this.cooldown = this.reloadTime;
    }

    // Method to handle reloading
    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }
}

// Class for the musket bullet
class MusketBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 15;
        this.damage = 100;
        this.isActive = true;
    }

    // Move the bullet in a straight line
    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);

        // Check for collisions with enemies
        for (const enemy of [...wolves, ...cows]) {
            if (Math.hypot(enemy.x - this.x, enemy.y - this.y) < 20 && this.isActive) {
                enemy.health -= this.damage;
                this.isActive = false;
                console.log(`Musket shot hit! Enemy health: ${enemy.health}`);
            }
        }
    }
}
// Add the musket to the player's inventory
function addMusketToInventory() {
    if (!player.weapons) player.weapons = [];
    player.weapons.push(new Musket());
    console.log("Musket added to inventory!");
}

// Switch to musket using the "M" key
document.addEventListener('keydown', (event) => {
    if (event.key === 'm') {
        switchToMusket();
    }
});

function switchToMusket() {
    const musket = player.weapons.find(w => w.type === "musket");
    if (musket) {
        player.weapon = musket;
        console.log("Switched to musket!");
    }
}

// Automatically fire the musket at enemies within range
function autoFireMusket() {
    const musket = player.weapon;
    if (musket && musket.type === "musket" && musket.cooldown === 0) {
        const enemy = findClosestEnemy(musket.reach);
        if (enemy) {
            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            musket.fire(angle);
        }
    }
}

let trees = [], NUM_TREES = 50, MIN_TREE_DISTANCE = 300;

function spawnTrees() {
    for (let t = 0; t < 50; t++) {
        let t = !1, e, a;
        for (;!t; ) if (t = !0, isValidSpawnLocation(e = Math.random() * (WORLD_WIDTH - 400) + 200, a = Math.random() * (WORLD_HEIGHT - 400) + 200)) for (var s of trees) {
            var i = e - s.x, s = a - s.y;
            if (Math.sqrt(i * i + s * s) < 300) {
                t = !1;
                break;
            }
        } else t = !1;
        trees.push(new Tree(e, a));
    }
}

canvas.addEventListener("mousemove", t => {
    var e = player.x - camera.x, a = player.y - camera.y;
    player.weaponAngle = Math.atan2(t.clientY - a, t.clientX - e);
}), document.addEventListener("keydown", t => {
    "2" !== t.key || window.battleMode || ("bow" === player.secondaryWeapon ? player.heldItem = "bow" === player.heldItem ? "weapon" : "bow" : player.hasCookieUpgrade ? player.heldItem = "cookie" === player.heldItem ? "weapon" : "cookie" : player.heldItem = "apple" === player.heldItem ? "weapon" : "apple");
}), document.addEventListener("keydown", t => {
    if (window.battleMode) switch (t.key) {
      case "1":
        player.heldItem = "weapon";
        break;

      case "2":
        player.heldItem = "bow";
        break;

      case "3":
        player.heldItem = "cookie";
        break;

      case "4":
        player.heldItem = "stoneWall";
        break;
      case "5":
        player.heldItem = "spike";
        break;
        case "v":
        player.heldItem = "spike";
        break;

      case "6":
        player.heldItem = "trap";
        break;

      case "7":
        player.heldItem = "boost";
    }
}), document.addEventListener("keydown", t => {
    switch (t.key.toLowerCase()) {
      case "a":
        player.moveLeft = !0;
        break;

      case "d":
        player.moveRight = !0;
        break;

      case "w":
        player.moveUp = !0;
        break;

      case "s":
        player.moveDown = !0;
        break;

      case "e":
        player.autoAttack = !player.autoAttack;
    }
}), document.addEventListener("keyup", t => {
    switch (t.key.toLowerCase()) {
      case "a":
        player.moveLeft = !1;
        break;

      case "d":
        player.moveRight = !1;
        break;

      case "w":
        player.moveUp = !1;
        break;

      case "s":
        player.moveDown = !1;
        break;

      case " ":
        player.spaceAttack = !1;
    }
}), canvas.addEventListener("mousedown", t => {
    if (0 === t.button) {
        switch (player.heldItem) {
          case "stoneWall":
            20 <= player.resources.stone && (isWallOverlapping(e = player.x + 50 * Math.cos(player.weaponAngle), a = player.y + 50 * Math.sin(player.weaponAngle)) || (walls.push(new StoneWall(e, a)), 
            player.resources.stone -= 20, player.heldItem = "weapon"));
            break;

          case "trap":
            30 <= player.resources.stone && 30 <= player.resources.wood && (isWallOverlapping(e = player.x + 50 * Math.cos(player.weaponAngle), a = player.y + 50 * Math.sin(player.weaponAngle)) || (traps.push(new Trap(e, a)), 
            player.resources.stone -= 30, player.resources.wood -= 30, player.heldItem = "weapon"));
            break;

          case "boost":
            var e, a;
            20 <= player.resources.stone && 5 <= player.resources.wood && (isWallOverlapping(e = player.x + 50 * Math.cos(player.weaponAngle), a = player.y + 50 * Math.sin(player.weaponAngle)) || (boostPads.push(new BoostPad(e, a, player.weaponAngle)), 
            player.resources.stone -= 20, player.resources.wood -= 5, player.heldItem = "weapon"));
            break;

          case "apple":
          case "cookie":
            player.healWithApple(), player.heldItem = "weapon";
            break;

          case "weapon":
            player.mouseAttack = !0, player.weapon.startAttack();
        }
        var s;
        "spike" === player.heldItem && 20 <= player.resources.wood && 5 <= player.resources.stone && spikes.length < MAX_SPIKES && (isWallOverlapping(t = player.x + 50 * Math.cos(player.weaponAngle), s = player.y + 50 * Math.sin(player.weaponAngle)) || (spikes.push(new Spike(t, s)), 
        player.resources.wood -= 20, player.resources.stone -= 5, player.heldItem = "weapon")), 
        "bow" === player.heldItem && 1e3 <= (t = Date.now()) - player.lastArrowTime && (s = new Arrow(player.x + 50 * Math.cos(player.weaponAngle), player.y + 50 * Math.sin(player.weaponAngle), player.weaponAngle), 
        player.arrows.push(s), player.lastArrowTime = t);
    }
}), document.addEventListener("keydown", t => {
    if (" " === t.key) {
        switch (player.heldItem) {
          case "stoneWall":
            20 <= player.resources.stone && (isWallOverlapping(e = player.x + 50 * Math.cos(player.weaponAngle), a = player.y + 50 * Math.sin(player.weaponAngle)) || (walls.push(new StoneWall(e, a)), 
            player.resources.stone -= 20, player.heldItem = "weapon"));
            break;

          case "boost":
            20 <= player.resources.stone && 5 <= player.resources.wood && (isWallOverlapping(e = player.x + 50 * Math.cos(player.weaponAngle), a = player.y + 50 * Math.sin(player.weaponAngle)) || (boostPads.push(new BoostPad(e, a, player.weaponAngle)), 
            player.resources.stone -= 20, player.resources.wood -= 5, player.heldItem = "weapon"));
            break;

          case "trap":
            var e, a;
            30 <= player.resources.stone && 30 <= player.resources.wood && (isWallOverlapping(e = player.x + 50 * Math.cos(player.weaponAngle), a = player.y + 50 * Math.sin(player.weaponAngle)) || (traps.push(new Trap(e, a)), 
            player.resources.stone -= 30, player.resources.wood -= 30, player.heldItem = "weapon"));
            break;

          case "apple":
          case "cookie":
            player.healWithApple(), player.heldItem = "weapon";
            break;

          case "weapon":
            player.spaceAttack = !0, player.weapon.startAttack();
        }
        var s;
        "spike" === player.heldItem && 20 <= player.resources.wood && 5 <= player.resources.stone && spikes.length < MAX_SPIKES && (isWallOverlapping(t = player.x + 50 * Math.cos(player.weaponAngle), s = player.y + 50 * Math.sin(player.weaponAngle)) || (spikes.push(new Spike(t, s)), 
        player.resources.wood -= 20, player.resources.stone -= 5, player.heldItem = "weapon")), 
        "bow" === player.heldItem && 1e3 <= (t = Date.now()) - player.lastArrowTime && (s = new Arrow(player.x + 50 * Math.cos(player.weaponAngle), player.y + 50 * Math.sin(player.weaponAngle), player.weaponAngle), 
        player.arrows.push(s), player.lastArrowTime = t);
    }
}), document.querySelectorAll(".item-button").forEach(t => {
    t.addEventListener("click", function() {
        let t = this.dataset.item, e = parseInt(this.dataset.price), a = "snow_hat" === t ? 4 : "soldier_hat" === t ? 5 : "speed_hat" === t ? 6 : 0;
        var s;
        shopItems[t].owned ? (s = document.querySelectorAll(".item-button"), player.skinIndex[0] === a ? (player.skinIndex[0] = null, 
        soldierEq = !1, s.forEach(t => {
            shopItems[t.dataset.item].owned && (t.textContent = "Equip");
        })) : (player.skinIndex[0] = a, soldierEq = 5 == a, s.forEach(t => {
            var e;
            shopItems[t.dataset.item].owned && (e = "snow_hat" === t.dataset.item ? 4 : "soldier_hat" === t.dataset.item ? 5 : "speed_hat" === t.dataset.item ? 6 : 0, 
            t.textContent = e == a ? "Unequip" : "Equip");
        }))) : player.resources.gold >= e && (player.resources.gold -= e, shopItems[t].owned = !0, 
        player.ownedSkins.push(a), this.textContent = "Equip");
    });
}), document.getElementById("shopBtn").addEventListener("click", () => {
    var t = document.getElementById("shopMenu");
    t.style.display = "block" === t.style.display ? "none" : "block";
}), canvas.addEventListener("mouseup", t => {
    0 === t.button && (player.mouseAttack = !1);
});

let bosses = [], wolves = [], NUM_WOLVES = 0;

function spawnWolves() {
    for (let t = 0; t < NUM_WOLVES; t++) {
        let t = !1, e, a;
        for (;!t; ) if (t = !0, !isValidSpawnLocation(e = Math.random() * (WORLD_WIDTH - 400) + 200, a = Math.random() * (WORLD_HEIGHT - 400) + 200)) {
            t = !1;
            continue;
        }
        wolves.push(new Wolf(e, a));
    }
}

function spawnDesertScorpion() {
    let t = !1, e, a;
    for (;!t; ) if (t = !0, !isValidSpawnLocation(e = Math.random() * (WORLD_WIDTH - 400) + 200, a = .7 * WORLD_HEIGHT + Math.random() * (.3 * WORLD_HEIGHT))) {
        t = !1;
        continue;
    }
    var s = new DesertScorpion(e, a);
    bosses.push(s);
}

function spawnStoneGiant() {
    var t = Math.random() * (WORLD_WIDTH / 3) + WORLD_WIDTH / 3, e = Math.random() * (WORLD_HEIGHT / 3) + WORLD_HEIGHT / 3, t = new StoneGiant(t, e);
    bosses.push(t);
}
function createIceDragonArena(dragonX, dragonY) {
    const radius = 300; // Arena radius
    const numStones = 30; // Number of stones in circle
    
    // Create circle of stone walls
    for(let i = 0; i < numStones; i++) {
        const angle = (i / numStones) * Math.PI * 2;
        const x = dragonX + Math.cos(angle) * radius;
        const y = dragonY + Math.sin(angle) * radius;
        walls.push(new StoneWallX(x, y));
    }
}

function spawnIceDragon() {
    const x = Math.random() * (WORLD_WIDTH - 400) + 200;
    const y = Math.random() * (WORLD_HEIGHT * 0.3);
    
    createIceDragonArena(x, y);
    const dragon = new IceDragon(x, y);
    bosses.push(dragon);
    
    return dragon;
}

let gameLoopId = null, gameStarted = !1;
function normalizeAngle(angle) {
    while (angle < -Math.PI) angle += 2 * Math.PI;
    while (angle > Math.PI) angle -= 2 * Math.PI;
    return angle;
}

function gameLoop() {
    if (ctx.clearRect(0, 0, canvas.width, canvas.height), gameStarted) {
        for (var t of (drawBiomes(), drawRiver(), drawGrid(), cows)) t.update(), 
        t.draw();
        for (var e of wolves) e.update(), e.draw();
        for (var a of bosses) a.update(), a.draw(ctx);
        for (var s of trees) s.draw();
        for (var i of rocks) i.draw();
        for (var n of bushes) n.draw();
        for (var o of walls) o.draw();
        for (let s of (particles = particles.filter(t => !t.isDead() && (t.update(), 
        t.draw(), !0)), boostPads)) {
            s.draw();
            var h = player.x - s.x, r = player.y - s.y;
            Math.sqrt(h * h + r * r) < s.hitboxRadius + player.radius && s.applyBoost(player), 
            wolves.forEach(t => {
                var e = t.x - s.x, a = t.y - s.y;
                Math.sqrt(e * e + a * a) < s.hitboxRadius + t.radius && s.applyBoost(t);
            });
        }
        // Add to player's weapon hit detection
// Add to player's weapon hit detection
// Add to Arrow update method


bosses.forEach(boss => {
    if (boss instanceof IceDragon && (player.mouseAttack || player.spaceAttack)) {
        const dx = boss.x - player.x;
        const dy = boss.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= player.weapon.reach + boss.radius) {
            const angle = Math.atan2(dy, dx);
            const weaponAngleDiff = Math.abs(normalizeAngle(player.weaponAngle - angle));
            
            if (weaponAngleDiff <= Math.PI / 4) {  // Made angle check more strict
                boss.health -= player.weapon.damage;
                
                // Visual feedback
                const damageText = new DamageText(boss.x, boss.y, player.weapon.damage);
                damageTexts.push(damageText);
                
                // Knockback effect
                const knockbackForce = 40;
                boss.x += Math.cos(angle) * knockbackForce;
                boss.y += Math.sin(angle) * knockbackForce;
            }
        }
    }
});


        for (let h of spikes) {
            h.draw();
            // Add Ice Dragon collision with spikes
            
            bosses.forEach(boss => {
                if (boss instanceof IceDragon) {
                    const dx = boss.x - h.x;
                    const dy = boss.y - h.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < h.hitboxRadius + boss.radius) {
                        boss.health -= h.damage;
                        const damageText = new DamageText(boss.x, boss.y, h.damage);
                        damageTexts.push(damageText);
                        
                        // Knockback effect
                        const knockbackAngle = Math.atan2(dy, dx);
                        const knockbackDuration = 200;
                        const startTime = Date.now();
                        
                        const applyKnockback = () => {
                            const elapsed = Date.now() - startTime;
                            if (elapsed < knockbackDuration) {
                                const force = 15 * (1 - elapsed / knockbackDuration);
                                boss.x += Math.cos(knockbackAngle) * force;
                                boss.y += Math.sin(knockbackAngle) * force;
                                requestAnimationFrame(applyKnockback);
                            }
                        };
                        applyKnockback();
                    }
                }
            });
        }        
        for (let h of spikes) h.draw(), wolves.forEach(i => {
            var t = i.x - h.x, n = i.y - h.y;
            if (Math.sqrt(t * t + n * n) < h.hitboxRadius + i.hitboxRadius) {
                i.health -= h.damage;
                var o = new DamageText(i.x, i.y, h.damage);
                damageTexts.push(o), i.health <= 0 && -1 < (o = wolves.indexOf(i)) && (wolves.splice(o, 1), 
                o = spawnSingleWolf(), wolves.push(o), player.incrementAgeProgress(120), 
                player.resources.apple += 200);
                let e = Date.now(), a = Math.atan2(n, t), s = () => {
                    var t = Date.now() - e;
                    t < 200 && (t = 15 * (1 - t / 200), i.x += Math.cos(a) * t, 
                    i.y += Math.sin(a) * t, requestAnimationFrame(s));
                };
                s();
            }
        }), cows.forEach(i => {
            var t = i.x - h.x, n = i.y - h.y;
            if (Math.sqrt(t * t + n * n) < h.hitboxRadius + i.radius) {
                i.health -= h.damage;
                var o = new DamageText(i.x, i.y, h.damage);
                damageTexts.push(o), i.health <= 0 && -1 < (o = cows.indexOf(i)) && (cows.splice(o, 1), 
                o = spawnSingleCow(), cows.push(o), player.incrementAgeProgress(30), 
                player.resources.apple += 100);
                let e = Date.now(), a = Math.atan2(n, t), s = () => {
                    var t = Date.now() - e;
                    t < 200 && (t = 10 * (1 - t / 200), i.x += Math.cos(a) * t, 
                    i.y += Math.sin(a) * t, requestAnimationFrame(s));
                };
                s();
            }
        });
        if (player.weapon && player.weapon.type === "musket") {
            player.weapon.update();
            autoFireMusket();
        }
        if (otherPlayers) {
            drawOtherPlayer(otherPlayers);
        }
        for (let t = damageTexts.length - 1; 0 <= t; t--) damageTexts[t].update(), 
        damageTexts[t].draw(ctx), damageTexts[t].lifespan <= 0 && damageTexts.splice(t, 1);
        for (var l of traps) l.checkTrigger(), l.draw();
        player.update(), player.draw(), drawMinimap(), drawAgeBar(), drawResourceUI();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

function drawOtherPlayer(t) {
    var e = t.x - camera.x, a = t.y - camera.y, s = (ctx.beginPath(), ctx.arc(e + 22 * Math.cos(t.angle - .8), a + 22 * Math.sin(t.angle - .8), 8, 0, 2 * Math.PI), 
    ctx.fillStyle = "#e5bdac", ctx.fill(), ctx.lineWidth = 2, ctx.strokeStyle = "#8b7355", 
    ctx.stroke(), ctx.closePath(), ctx.beginPath(), ctx.arc(e + 22 * Math.cos(t.angle + .8), a + 22 * Math.sin(t.angle + .8), 8, 0, 2 * Math.PI), 
    ctx.fillStyle = "#e5bdac", ctx.fill(), ctx.lineWidth = 2, ctx.strokeStyle = "#8b7355", 
    ctx.stroke(), ctx.closePath(), e + 22 * Math.cos(t.angle + .8)), i = a + 22 * Math.sin(t.angle + .8), s = (ctx.save(), 
    ctx.translate(s, i), ctx.rotate(t.angle), ctx.drawImage(hammer, -12, -35, 45, 70), 
    ctx.restore(), ctx.beginPath(), ctx.arc(e, a, 20, 0, 2 * Math.PI), ctx.fillStyle = "#e5bdac", 
    ctx.fill(), ctx.lineWidth = 2, ctx.strokeStyle = "#8b7355", ctx.stroke(), ctx.closePath(), 
    ctx.fillStyle = "#000", ctx.font = "14px Nunito Bold", ctx.textAlign = "center", ctx.fillText(t.name || "Player", e, a - 30), 
    30 + a);
    ctx.beginPath(), ctx.roundRect(e - 25, s, 50, 8, 4), ctx.lineWidth = 2, ctx.strokeStyle = "#000", 
    ctx.stroke(), ctx.beginPath(), ctx.roundRect(e - 25, s, 50, 8, 4), ctx.fillStyle = "#ff0000", 
    ctx.fill(), ctx.beginPath(), ctx.roundRect(e - 25, s, t.health / 100 * 50, 8, 4), 
    ctx.fillStyle = "#00ff00", ctx.fill();
}

document.getElementById("enterGame").addEventListener("click", () => {
    var t = document.getElementById("playerName").value || "Player", e = document.getElementById("skinColor").value, a = (document.getElementById("showPing").checked,
    document.getElementById("nativeResolution").checked);
    player.name = t, player.color = e, document.getElementById("startMenu").style.display = "none",
    document.getElementById("gameCanvas").style.display = "block", document.getElementById("minimap").style.display = "block",
    document.querySelector('.toolbar').style.display = 'flex',
    a && (canvas.width = window.innerWidth, canvas.height = window.innerHeight),
    gameLoopId && cancelAnimationFrame(gameLoopId), gameStarted = !0, gameLoop();
}), spawnTrees(), spawnRocks(), spawnBushes(), spawnCows(), spawnWolves(), spawnStoneGiant();

let player = new Player(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
spawnIceDragon();
spawnDesertScorpion();