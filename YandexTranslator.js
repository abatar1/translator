function YandexTranslator()
{
    var serviceUrl = "https://translate.yandex.net/api/v1.5/tr.json/";
    var apiKey = getApiKey();   
    
    function getApiKey() 
    {
        var nameEQ = "key=";
        var eq = document.cookie; 
        var key = eq.substring(nameEQ.length, eq.length);  
        if (key == "") 
        {
            key = prompt("Please enter your api-key:", "");
            document.cookie = "key=" + key;
        } 
        return key;
    }

    function sendRequest(command, additionalQueries, processor)
    {
        var httpRequest = new XMLHttpRequest();
        var url = serviceUrl + command + "?key=" + apiKey + additionalQueries;

        httpRequest.open("GET", url, true);
        httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");     
        
        httpRequest.onreadystatechange = function() 
        {
            switch(this.status)
            {
                case 200:
                    processor(this);
                    break;
                case 401:
                    throw new ApiException("Неправильный API-ключ");                    
                case 402:
                    throw new ApiException("API-ключ заблокирован.");
                case 404:
                    throw new ApiException("Превышено суточное ограничение на объем переведенного текста.");
                case 413:
                    throw new TranslateException("Превышен максимально допустимый размер текста.");
                case 422:
                    throw new TranslateException("Текст не может быть переведен.");
                case 501:
                    throw new TranslateException("Заданное направление перевода не поддерживается.");
            }
        }
        httpRequest.send();
    }

    function formatText(text)
    {
        var formattedText =  text
            .split(/\s+/)
            .join(' ')
            .trim()
            .replace(/\r?\n/g, '<br />');

        if (formattedText == "") throw new TranslateException("Пустое поле ввода.");
        return formattedText;
    }

    this.getSupportedLanguages = function(callback)
    {
        sendRequest("getLangs", "&ui=ru", function(httpResponse)
        {
            var htmlSelect = "<option value=\"empty\" selected=\"selected\"</option>";
            var langsJson = JSON.parse(httpResponse.responseText).langs;               

            for (var key in langsJson) 
            {
                htmlSelect += "<option value=" + key + ">" +langsJson[key] + "</option>"
            }     

            callback(htmlSelect);
        });
    }

    this.determineLanguage = function(text, callback)
    {
        var formattedText = formatText(text);
        var additionalQuery = "&text=" + formattedText;

        sendRequest("detect", additionalQuery, function(httpResponse)
        {
            callback(JSON.parse(httpResponse.responseText).lang); 
        });
    }

    this.translate = function(text, fromCode, toCode, callback)
    {
        var formattedText = formatText(text);
        var translationDir = fromCode + "-" + toCode;
        var additionalQuery = "&text=" + formattedText + "&lang=" + translationDir;

        sendRequest("translate", additionalQuery, function(httpResponse)
        {
            callback(JSON.parse(httpResponse.responseText).text[0]); 
        });
    }

    function TranslateException(message) 
    {
        this.name = "TranslateException";
        
        this.message = message;
    }

    function ApiException(message) 
    {
        this.name = "ApiException";

        this.message = message;
    }
}
