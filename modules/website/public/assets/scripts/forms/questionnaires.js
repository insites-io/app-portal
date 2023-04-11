// Questionnaires Form Form
const formEl = document.getElementById('questionnaires-form');
const formSubmitBtn = document.getElementById('submit-btn-questionnaires');
const insFileUploaderEl = document.getElementById('document-input');
const documentFieldEl = document.getElementById('document');
const table = "modules/client/questionnaires";
const property = "attach_documents";
const s3CredentialsURL = `${window.location.origin}/api/s3-upload.json?table=${table}&property=${property}`;
// const phoneFields = {
//     inputTel: document.getElementById('phone-number-field'),
//     mobile_phone: document.getElementById('mobile_phone'),
//     country_code: document.getElementById('country_code')
// }



/** 
 * Questionnaires - Scripts / Functions
 * */
let Questionnaires = (function () {
    return {
        methods: {
            async submitForm() {
                // Submit form via API axios -> Create pOS Model
                let response = await FormServices.createContactUs({ 'payload': payload });
                if (response.state && response.data.items) {
                    // model has been created
                    this.successHandler();
                } else {
                    // API error: failed to submit form
                    this.errorHandler();
                }
            },
            successHandler() {
                window.location.href = `/thank-you`;
            },
            errorHandler() {
                formEl.querySelector('ins-button').loading = false;
                App.events.swal('error',
                    'API Error',
                    'Failed to send form enquiry. Please refresh and try again.',
                    'OK',
                    false);
            },
            async validateForm(event) {
                event ? event.preventDefault() : '';
                var captcha = true;
                // IF your form / instance have recaptcha enabled, uncommment this code instead
                //var captcha = App.validation.checkRecaptcha();

                console.log('entered validateForm');

                // Form fields with attribute 'validate' are validated
                if (await App.validation.validateForm(formEl) && captcha) {
                    formEl.querySelector('ins-button').loading = true;
                    await this.processAttachments();

                    // let values = await phoneFields.inputTel.getValues();
                    // phoneFields.country_code.value = values.country_code;
                    // phoneFields.mobile_phone.value = "+" + values.country_code + values.phone_number;
                    //return false;
                    formEl.submit();
                } else {
                    return false;
                }
            },
            async processAttachments() {
                console.log('entered processAttachments');
                if (insFileUploaderEl) {
                    let filesToUpload = await insFileUploaderEl.getFilesList().then(result => {
                        return result;
                    });

                    for (let index = 0; index < filesToUpload.length; index++) {
                        /*  This specific case only uploads 1 file, and return the uploaded S3 URL to the field in the form
                            Code implementation may change if your uploading multiple files / images at a time,
                            and assigning it to different fields, etc..
                        */

                        let s3URL = await this.uploadFile(filesToUpload[index]);
                        // assign to pOS hidden field s3 URL
                        documentFieldEl.value = s3URL;
                    }
                }
            },
            async uploadFile(file) {
                console.log('entered uploadFile');
                return new Promise(async resolve => {
                    let fileUrl = "";
                    if (file.upload_url) {
                        fileUrl = file.upload_url;
                    } else {
                        // if file has not dataURL yet
                        if (!file.dataURL) {
                            file.dataURL = await S3UploaderService.methods.convertFileToBase64(file);
                        }
                        // pass 'document' as it is the pOS field name
                        // pass 'media' depending on pOS field type
                        fileUrl = await S3UploaderService.methods.uploadToS3(s3CredentialsURL, file, file.name);
                    }
                    resolve(fileUrl);
                });
            }
        }
    }
})();