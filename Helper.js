function Helper()
{
    this.setApiKey = function()
    {
        var apiKey = prompt("Please enter your api-key:", "");
        document.cookie = "key=" + apiKey;
    }

    this.tryProcess = function(process)
    {
        try
        {
            process();
        }
        catch(error)
        {
            if (error.name == "TranslateException") 
            {
                messageTextArea.value = error.message;
            } 
            else if (error.name == "ApiException")
            {
                messageTextArea.value = error.message;
                setApiKey();
            }
            else throw error;
        }  
    }
}
