function LoadDocumentList() {
  var customerId = $("#customerId").val();
  $.ajax({
    url: "/Customer/GetAllFiles?customerId=" + customerId, // Update action and controller name if necessary
    type: "GET",
    success: function (result) {
      $("#profile-Documents").html(result); // Inject the partial view into the container
    },
    error: function () {
      alert("An error occurred while loading the document list.");
    },
  });
}
var folderN;
$(document).on("click", ".folder", function () {
  folderN = $(this).data("folder-name"); // Get folder name from data attribute
  loadFolderContents(folderN); // Pass it to the function
});

// Event listener for the "Go to Parent" button ViewBageOldPath
$(document).on("click", ".ViewBageOldPath", function () {
  var customerId = $("#customerId").val();
  var goToParentButton = document.getElementById("goToParent");
  var folderN = $(this).data("folder-name"); // Get folder name from data attribute
  if (
    folderN ==
      "D:\\Zippy-CRM\\ZippyCRM\\File\\DocumentManager\\Customer\\" +
        customerId ||
    folderN == ""
  ) {
    goToParentButton.disabled = true;
  } else {
    var parentPath = getParentPath(folderN); // Get the parent path
    loadFolderContents(parentPath);
  } // Load the contents of the parent folder
});

function getParentPath(path) {
  // Return the parent path by removing the last directory in the path
  return path.substring(0, path.lastIndexOf("\\"));
}

function loadFolderContents(path) {
  $.ajax({
    url: "/Customer/GetFolderContents", // Adjust the URL to your action
    type: "GET",
    data: { path: path },
    success: function (result) {
      $("#profile-Documents").html(result); // Replace with your container ID
    },
    error: function () {
      alert("Error loading folder contents.");
    },
  });
}
function CreateFolder() {
  var folderN = $("#folderName").val();
  var customerId = $("#customerId").val();
  $.ajax({
    url: "/Customer/CreateDirectory", // Update action and controller name if necessary
    type: "POST",
    data: {
      folderName: folderN,
      customerId: customerId,
    },
    success: function (result) {
      loadFolderContents(result.parentPath); // Inject the partial view into the container
    },
    error: function () {
      alert("An error occurred while folder not created the document list.");
    },
  });
}

$(document).on("click", ".delete-folder", function () {
  var folderN = $(this).data("folder-name"); // Get folder name from data attribute
  DeleteFolder(folderN); // Pass it to the function
});

// Function to delete a folder
function DeleteFolder(folderN) {
  var filePath = $("#filePathId").val();
  $.ajax({
    url: "/Customer/DeleteFolder", // Update action and controller name if necessary
    type: "POST",
    data: {
      folderName: folderN,
      filePath,
      filePath,
    },
    success: function (result) {
      loadFolderContents(result.basePath); // Inject the partial view into the container
    },
    error: function () {
      alert("An error occurred while trying to delete the folder.");
    },
  });
}

//Search File/Folder.

function SearchFolder() {
  var query = $("#searchInput").val(); // Get the search query
  var customerId = $("#customerId").val();

  $.ajax({
    url: "/Customer/GetAllFilesBySearching?customerId=" + customerId, // Update action and controller name if necessary
    type: "GET",
    data: { searchQuery: query },
    success: function (data) {
      $("#profile-Documents").html(data); // Update results container with new data
    },
    error: function (xhr, status, error) {
      console.error("Error fetching files:", error);
    },
  });
}

$(document).on("click", ".rename-folder", function (e) {
  e.preventDefault();
  // Get the current folder name from the data attribute
  var folderName = $(this).data("folder-id");

  // Set the value of the input field for renaming
  $("#renameInput").val(folderName); // Assume there's a single input for renaming
  $("#renameInput").data("current-folder", folderName); // Store the current folder name
  $("#renameInput").show(); // Show the input field
  $("#renameButton").show(); // Show the rename button
});

/* Event handler for the rename button click*/
$(document).on("click", "#renameButton", function () {
  var folderCurrent = $("#renameInput").data("current-folder");
  var folderNew = $("#renameInput").val();
  var folderN = $("#filePathId").val();
  if (folderNew) {
    // Check if the new name is not empty
    RenameFolder(folderN, folderCurrent, folderNew); // Call the renaming function
    $("#renameInput").hide(); // Hide the input field after renaming
    $("#renameButton").hide(); // Hide the button
  } else {
    alert("Please enter a valid folder name.");
  }
});

// Function to rename a folder
function RenameFolder(folderN, folderCurrent, folderNew) {
  $.ajax({
    url: "/Customer/RenameFolder", // Update action and controller name if necessary
    type: "POST",
    data: {
      folderN: folderN,
      currentFolder: folderCurrent,
      newFolderName: folderNew,
    },
    success: function (result) {
      loadFolderContents(result.folderN); // Inject the partial view into the container
      /*   $('#renameFolderModal').modal('hide');*/
    },
    error: function () {
      alert("An error occurred while trying to delete the folder.");
    },
  });
}

$(document).on("click", ".copy-folder", function () {
  var folderN = $(this).data("folder-name"); // Get folder name from data attribute
  var type = $(this).data("folder-id"); // Get folder name from data attribute
  CopyFolder(folderN, type); // Pass it to the function
});

function CopyFolder(folderN, type) {
  var customerId = $("#customerId").val();
  var customerId = $("#customerId").val();
  var filePath = $("#filePathId").val();

  $.ajax({
    url: "/Customer/CopyFolder", // Update action and controller name if necessary
    type: "POST",
    data: {
      CurrentFolderName: folderN,
      Type: type,
      customerId: customerId,
      filePath: filePath,
    },
    success: function (result) {},
    error: function (e) {
      alert("An error occurred while trying to Copy the folder.");
    },
  });
}

$(document).on("click", ".paste-folder", function () {
  var folderN = $(this).data("folder-name"); // Get folder name from data attribute
  PasteFolder(folderN); // Pass it to the function
});
function PasteFolder(NewFolder) {
  var filePath = $("#filePathId").val();
  var customerId = $("#customerId").val();
  $.ajax({
    url: "/Customer/PasteFolder",
    type: "POST",
    data: {
      destinationFoldername: NewFolder,
      customerId: customerId,
      filePath: filePath,
    },
    success: function (result) {
      LoadDocumentList();
    },
    error: function () {
      alert("An error occurred while trying to Copy the folder.");
    },
  });
}
