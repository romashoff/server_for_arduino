let socket = io();
socket.on("statistic",(data)=>{
    $("div#averages table tbody").html(
        `
                <td>${data.currentDayAverages.tempPerHour} °С</td>
                <td>${data.currentDayAverages.humidPerHour} г/м³</td>
                <td>${data.currentDayAverages.tempPerDay} °С</td>
                <td>${data.currentDayAverages.humidPerDay} г/м³</td>
        `
    )
    $("div#last table tbody").html(
        `
                <td>${data.lastStatistic.date}</td>
                <td>${data.lastStatistic.temp} °С</td>
                <td>${data.lastStatistic.humid} г/м³</td>
                <td>${data.lastStatistic.info} г/м³</td>
        `
    )
    if(data.button === "off"){
        $('#led-active').removeClass("on")
        $("#led").val("Led: Off")
    }else{
        $('#led-active').addClass("on")
        $("#led").val("Led: On")
    }
})
$(document).ready(()=>{
    $("#led").on("click",(e)=>{
        socket.emit("led");
    })
    $("#clear_search_b").on("click",(e)=>{
        $("#search").val("")
        $("#averages").show();
        $("#last").show();
        $("#sort table tbody").html("")
        $("#sort").hide();
    })
    $("#search_b").on("click",(e)=>{
        let date = $("#search").val()
        if(!date)
            return;
        socket.emit("search",date,(data)=>{
            $("#averages").hide();
            $("#last").hide();
            $("#sort").show();
            let html = "";
            data.map(x=>{
                html+= `  <td>${x.time_create}</td>
                <td>${x.temp} °С</td>
                <td>${x.humid} г/м³</td>
                <td>${x.info}</td>`
            })
            //записываем html
            $("#sort table tbody").html(html)
        });
    })

})