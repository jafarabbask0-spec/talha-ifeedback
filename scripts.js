(function() {
    // 1. MAIN UI EXECUTION (Direct Run)
    function executeMain() {
        // Default logo setup
        document.querySelector(".logo")?.setAttribute("src", "talha.png");

        // Live Time Logic
        var now = new Date();
        var amPm = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        document.querySelectorAll(".mob_time").forEach(el => el.innerText = now.getHours() + ":" + (now.getMinutes()<10?'0':'')+now.getMinutes());

        // --- BATTERY LOGIC ---
        var bInp = document.querySelector("input[type='number']");
        var bBar = document.querySelector(".battery2");
        var bTxt = document.querySelector(".battery_percent");

        if(bInp && bBar) {
            var updateBattery = function() {
                var val = parseInt(bInp.value);
                if(val > 100) val = 100;
                if(val < 0) val = 0;
                bBar.style.width = (val * 25 / 100) + "px";
                if(bTxt) bTxt.innerText = val + "%";
            };
            bInp.addEventListener('input', updateBattery);
            updateBattery(); // Initialize on load
        }

        // Chat Data Setup
        var names = ["MD Zeeshan","Anaya","Bilal","Alyan","Ajay","Fatima","Aliya","Sania"];
        var t_pos = [137, 206, 277, 346, 416, 486, 555, 624];
        var online_pos = [180, 251, 321, 390, 459, 529, 599, 669];
        var bgColors = ["#4794da","#fa7e5b","#f880a2","#8ece5f","#fdb456","#6b3fa0","#4794da","#fa7e5b"];
        var randomTexts = ["Sure shot win bhai!🎉","Signal 100% working💯","Bhai withdraw mil gaya😘","Profit booked today👍","Thanks for the signal💕","Next signal kab hai?🙄","Maza aa gaya bhai😋","Big profit booked🤩"];

        document.querySelectorAll('ul').forEach(ul => ul.innerHTML = "");

        names.forEach((name, i) => {
            let liDp = document.createElement("li");
            liDp.className = "chat_dp"; liDp.style.top = (t_pos[i]-1) + "px"; liDp.style.left = "9px";
            if (Math.random() > 0.4) {
                let rDpNum = Math.floor(Math.random() * 30) + 1;
                liDp.innerHTML = `<img src="dp${rDpNum}.png" style="width:57px; height:57px; border-radius:50%; object-fit:cover;">`;
            } else {
                let firstLetter = name ? name[0] : "T";
                liDp.innerHTML = `<span class="chat_named_dp" style="background:${bgColors[i]}; display:block; width:57px; height:57px; border-radius:50%; color:white; text-align:center; line-height:57px; font-size:22px; font-weight:bold;">${firstLetter}</span>`;
            }
            document.querySelector(".ul_chat_dp")?.appendChild(liDp);
            document.querySelector(".ul_chat_name").innerHTML += `<li class="chat_name" style="top:${t_pos[i]}px; left:73px;">${name}</li>`;
            document.querySelector(".ul_chat_time").innerHTML += `<li class="chat_time" style="top:${t_pos[i]+3}px;">${amPm}</li>`;
            
            let rType = Math.random();
            let msg = "";
            let rImg = Math.floor(Math.random() * 30) + 1;
            let rTxt = randomTexts[Math.floor(Math.random() * randomTexts.length)];
            if (rType > 0.7) { 
                msg = `<img src="${rImg}.png" style="width:17px;height:17px;margin-right:5px;border-radius:2px;"><span style="color:#61a4c8">Photo</span>`;
            } else if (rType > 0.4) { 
                msg = `<img src="${rImg}.png" style="width:17px;height:17px;margin-right:5px;border-radius:2px;"><span style="color:#929292">${rTxt}</span>`;
            } else { 
                msg = `<span style="color:#929292">${rTxt}</span>`;
            }
            document.querySelector(".ul_msg_img").innerHTML += `<li class="msg_img" style="top:${t_pos[i]+21}px;">${msg}</li>`;
            document.querySelector(".ul_count_bullet").innerHTML += `<li class="count_bullet" style="top:${t_pos[i]+31}px; left:334px;">${Math.floor(Math.random()*3)+1}</li>`;

            if(Math.random() > 0.5) {
                let liOn = document.createElement("li");
                liOn.className = "online_bullet";
                liOn.style.top = online_pos[i] + "px"; liOn.style.left = "48px";
                document.querySelector(".ul_online_bullet")?.appendChild(liOn);
            }
        });

        // 2. ULTRA HD DOWNLOAD LOGIC
        var dlBtn = document.querySelector(".btn");
        if(dlBtn) {
            dlBtn.setAttribute("contenteditable", "false");
            dlBtn.onclick = function() {
                document.body.contentEditable = "false";
                dlBtn.style.display = "none";
                
                html2canvas(document.querySelector("#box"), {
                    scale: 4, 
                    useCORS: true,
                    allowTaint: true,
                    imageTimeout: 0,
                    backgroundColor: null,
                    logging: false
                }).then(canvas => {
                    var link = document.createElement('a');
                    link.download = 'TalhaTrader_UltraHD.png';
                    link.href = canvas.toDataURL("image/png", 1.0);
                    link.click();
                    
                    dlBtn.style.display = "block";
                    document.body.contentEditable = "true";
                });
            };
        }

        document.querySelector("#box").style.display = "block";
        document.body.contentEditable = "true";
    }

    // Initialize layout immediately
    executeMain();
})();
