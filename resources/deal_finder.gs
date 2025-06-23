function processConfirmedEmails() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var confirmedLabel = GmailApp.getUserLabelByName("Deal Finder");
    
    // Check if label exists
    if (!confirmedLabel) {
      Logger.log("Error: 'Deal Finder' label not found.");
      return;
    }

    // Get the last 5 threads with the "Deal Finder" label
    var threads = confirmedLabel.getThreads(0, 5);
    
    // Check if threads exist
    if (!threads.length) {
      Logger.log("No threads found with 'Deal Finder' label.");
      return;
    }

    // Log thread details
    Logger.log("Found %s threads with 'Deal Finder' label:", threads.length);
    threads.forEach((thread, index) => {
      var messages = thread.getMessages();
      if (!messages.length) {
        Logger.log("Thread %s: No messages found. Subject: %s", index + 1, thread.getFirstMessageSubject());
        return;
      }
      
      var lastMessage = messages[messages.length - 1];
      // Log thread details
      Logger.log("Thread %s:", index + 1);
      Logger.log("  Subject: %s", thread.getFirstMessageSubject());
      Logger.log("  Last Message From: %s", lastMessage.getFrom());
      Logger.log("  Last Message Date: %s", lastMessage.getDate());
      Logger.log("  Last Message Snippet: %s", lastMessage.getPlainBody().substring(0, 100) + "...");
      
      var emailBody = lastMessage.getPlainBody().trim(); // Trim whitespace
      Logger.log("Full Email Body for Thread %s:\n%s", index + 1, emailBody);

      // Send email body to AI API for extraction
      var extractedData = extractDataUsingAI(emailBody);

      // Append extracted details to Google Sheet
      sheet.appendRow([
        extractedData.promotion_start_date,
        extractedData.promotion_end_date,
        extractedData.business_name,
        extractedData.web_address,
        extractedData.discount_percentage
      ]);
      
      // Add delay to avoid rate limits
      Utilities.sleep(1000);
    });
  } catch (e) {
    Logger.log("Error in processConfirmedEmails: %s", e.message);
  }
}

function extractDataUsingAI(emailBody) {
  var url = "https://deal-finder-demo-app-774109141280.us-central1.run.app/extract-job-details";
  
  var payload = {
    email_text: emailBody
  };

  var headers = {
    "x-api-key": PropertiesService.getScriptProperties().getProperty('API_KEY') || "xai-8EF0mro6SAzoCVkVrP5fVWSlET62OzCriWcOWk8Q4mjyVeZ7xUX7SP5swaLhddp4qAL1RfaGjnFEYVta",
    "Content-Type": "application/json",
    "User-Agent": "GoogleAppsScript/1.0" // Add user agent to mimic curl
  };

  var options = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    followRedirects: true
  };

  try {
    Logger.log("Sending API Request to: %s", url);
    Logger.log("Request Payload: %s", JSON.stringify(payload));
    Logger.log("Request Headers: %s", JSON.stringify(headers));
    
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log("API Response Status Code: %d", responseCode);
    Logger.log("API Response: %s", responseText);

    if (responseCode !== 200) {
      Logger.log("API request failed with status %d", responseCode);
      throw new Error("Non-200 response: " + responseText);
    }

    var result = JSON.parse(responseText);
    
    // Log parsed result
    Logger.log("Parsed API Result: %s", JSON.stringify(result));

    return {
      promotion_start_date: result.promotion_start_date || "",
      promotion_end_date: result.promotion_end_date || "",
      business_name: result.business_name || "",
      web_address: result.web_address || "",
      discount_percentage: result.discount_percentage || ""
    };
  } catch (e) {
    Logger.log("Error calling AI API: %s", e.message);
    return {
      promotion_start_date: "ERROR",
      promotion_end_date: "ERROR",
      business_name: "ERROR",
      web_address: "ERROR",
      discount_percentage: "ERROR"
    };
  }
}




