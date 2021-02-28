// Cameron Samuels

window.addEventListener("DOMContentLoaded", () => {

    if (window.location.hash === "#gameover")
        document.querySelector("a").textContent = "retry";

    function hashChange() {
        var hash = window.location.hash.substring(1);
        var pages = document.querySelectorAll("main");
        for (let i = 0; i < pages.length; i++)
            pages[i].style.display = pages[i].id === hash ? "block" : "";
        var buttons = document.querySelectorAll("#buttons a");
        if (hash === "" || hash === "gameover") {
            document.querySelector("main").style.display = "block";
            for (let i = 0; i < buttons.length; i++)
                buttons[i].style.display = "";
            document.querySelector("#buttons a").style.display = "none";
        }
        else {
            for (let i = 0; i < buttons.length; i++)
                buttons[i].style.display = "none";
            document.querySelector("#buttons a").style.display = "";
        }
    }
    window.addEventListener("hashchange", hashChange);
    hashChange();

    var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000/60) };
    
    function initiateBall(x, y, dx, dy, c) {

        var ball = document.createElement("div");
        ball.className = "ball";
        ball.style.background = c;
        document.body.appendChild(ball);

        var direction = [dx, dy];
        var coords = [x, y];
        var m = [Math.random(), Math.random()];

        function ballBounce() {
            var dX = direction[0];
            var dY = direction[1];
            coords[0] += (dX ? m[0] : -m[0]);
            coords[1] += (dY ? m[1] : -m[1]);
            if (coords[0] <= 0) direction[0] = true;
            if (coords[0] >= 100) direction[0] = false;
            if (coords[1] <= 0) direction[1] = true;
            if (coords[1] >= 100) direction[1] = false;
            ball.style.left = coords[0] + "vw";
            ball.style.top = coords[1] + "vh";
            animate(ballBounce);
        }

        ballBounce();

    }

    initiateBall(0, 0, true, true, "#f00");
    initiateBall(75, 75, false, true, "green");
    initiateBall(80, 20, false, true, "#00f");

    document.addEventListener("mousedown", function(e) {
        e.preventDefault();
    });

});
