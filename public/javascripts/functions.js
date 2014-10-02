var socket = io.connect('http://localhost:3000');
 

$(document).ready(function()
{
    manageSessions.unset("login");
});
 

function animateScroll()
{
    var container = $('#containerMessages');
    container.animate({"scrollTop": $('#containerMessages')[0].scrollHeight}, "slow");
}
 

$(function()
{
    
    animateScroll();
    
    showModal("Ingresa Tu Nickname",renderForm());
    
    $("#containerSendMessages, #containerSendMessages input").on("focus click", function(e)
    {
        e.preventDefault();
        if(!manageSessions.get("login"))
        {
            showModal("Ingresa Tu Nickname",renderForm(), false);
        }
    });
 
    
    $("#loginBtn").on("click", function(e)
    {
        e.preventDefault();
        
        if($(".username").val().length < 2)
        {
            
            $(".errorMsg").hide();
            
            $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>Debes introducir un nombre para acceder al chat.</div>").focus(); 
            
            return;
        }
        
        manageSessions.set("login", $(".username").val());
        
        socket.emit("loginUser", manageSessions.get("login"));
        
        $("#formModal").modal("hide");
        
        animateScroll();
    });
 
    
    socket.on("userInUse", function()
    {
        
        $("#formModal").modal("show");
        
        manageSessions.unset("login");
        
        $(".errorMsg").hide();
       
        $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>Este Nickname Ya Esta En Uso.</div>").focus();
        return; 
    });
 
    
    socket.on("refreshChat", function(action, message)
    {
        
        if(action == "conectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-info'>" + message + "</p>");
        }
       
        else if(action == "desconectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-danger'>" + message + "</p>");
        }
         
        else if(action == "msg")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-warning'>" + message + "</p>");
        }
        
        else if(action == "yo")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-success'>" + message + "</p>");
        }
        
        animateScroll();
    });
 
    

    socket.on("updateSidebarUsers", function(usersOnline)
    {
        
        $("#chatUsers").html("");
        
        if(!isEmptyObject(usersOnline))
        {
            
            $.each(usersOnline, function(key, val)
            {
                $("#chatUsers").append("<p class='col-md-12 alert-info'>" + key + "</p>");
            })
        }
    });
 
    
    $('.sendMsg').on("click", function() 
    {
        
        var message = $(".message").val();
        if(message.length > 2)
        {
            
            socket.emit("addNewMessage", message);
            
            $(".message").val("");
        }
        else
        {
            showModal("Error formulario","<p class='alert alert-danger'>El mensaje debe de contener al menos dos caracteres.</p>", "true");
        }
        
        animateScroll();
    });
 
});
 

function showModal(title,message,showClose)
{
    console.log(showClose)
    $("h2.title-modal").text(title).css({"text-align":"center"});
    $("p.formModal").html(message);
    if(showClose == "true")
    {
        $(".modal-footer").html('<a data-dismiss="modal" aria-hidden="true" class="btn btn-danger">Cancelar</a>');
        $("#formModal").modal({show:true});
    }
    else
    {
        $("#formModal").modal({show:true, backdrop: 'static', keyboard: true });
    }
}
 

function renderForm()
{
    var html = "";
    html += '<div class="form-group" id="formLogin">';
    html += '<input type="text" id="username" class="form-control username" placeholder="Introduce un Nickname">';
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary btn-large" id="loginBtn">Entrar</button>';
    return html;
}
 

var manageSessions = {

    get: function(key) {
        return sessionStorage.getItem(key);
    },

    set: function(key, val) {
        return sessionStorage.setItem(key, val);
    },

    unset: function(key) {
        return sessionStorage.removeItem(key);
    }
};
 

function isEmptyObject(obj) 
{
    var name;
    for (name in obj) 
    {
        return false;
    }
    return true;
}