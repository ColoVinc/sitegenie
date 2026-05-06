jQuery(function ($) {

    // Toggle sezioni provider
    function toggleProvider() {
        var provider = $('#vcai-provider-select').val();
        $('.vcai-provider-section').hide();
        $('#vcai-provider-' + provider).show();
    }
    $('#vcai-provider-select').on('change', toggleProvider);
    toggleProvider();

    // Test connessione API
    $('#vcai-test-api').on('click', function () {
        const $btn    = $(this);
        const $result = $('#vcai-test-result');

        $btn.prop('disabled', true).text('⏳ Test in corso...');
        $result.removeClass('success error').text('');

        $.post(vcai.ajax_url, {
            action: 'vcai_test_api',
            nonce:  vcai.nonce,
        })
        .done(function (res) {
            if (res.success) {
                $result.addClass('success').text('✅ ' + res.data);
            } else {
                $result.addClass('error').text('❌ ' + res.data);
            }
        })
        .fail(function () {
            $result.addClass('error').text('❌ Errore di connessione.');
        })
        .always(function () {
            $btn.prop('disabled', false).text('🔌 Testa Connessione');
        });
    });

    // Svuota log
    $('#vcai-clear-logs').on('click', function () {
        if ( ! confirm( 'Sei sicuro di voler svuotare tutti i log? L\'operazione non è reversibile.' ) ) return;

        const $btn = $(this);
        $btn.prop('disabled', true).text('⏳ Svuotamento...');

        $.post(vcai.ajax_url, {
            action: 'vcai_clear_logs',
            nonce:  vcai.nonce,
        })
        .done(function (res) {
            if (res.success) {
                location.reload();
            } else {
                alert('Errore: ' + res.data);
                $btn.prop('disabled', false).text('🗑️ Svuota Log');
            }
        })
        .fail(function () {
            alert('Errore di connessione.');
            $btn.prop('disabled', false).text('🗑️ Svuota Log');
        });
    });


    // Mostra dettaglio errore nei log
    $(document).on('click', '.vcai-log-error', function () {
        var msg = $(this).data('error') || 'Errore sconosciuto';
        var $modal = $('<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;">'
            + '<div style="background:#fff;border-radius:8px;padding:24px;max-width:500px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);">'
            + '<h3 style="margin:0 0 12px;font-size:15px;color:#d63638;"><i class="fa-solid fa-circle-exclamation"></i> Dettaglio Errore</h3>'
            + '<p style="margin:0 0 16px;font-size:13px;color:#333;word-break:break-word;">' + $('<span>').text(msg).html() + '</p>'
            + '<button style="background:#0f3460;color:#fff;border:0;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:13px;">Chiudi</button>'
            + '</div></div>');
        $modal.on('click', 'button', function () { $modal.remove(); });
        $modal.on('click', function (e) { if (e.target === this) $modal.remove(); });
        $('body').append($modal);
    });

    // ── Knowledge Base ───────────────────────────────────────────

    // Carica file .txt nel textarea
    $('#vcai-kb-file').on('change', function () {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#vcai-kb-content').val(e.target.result);
            if (!$('#vcai-kb-name').val()) {
                $('#vcai-kb-name').val(file.name.replace(/\.txt$/i, ''));
            }
        };
        reader.readAsText(file);
    });

    // Upload documento
    $('#vcai-kb-upload').on('click', function () {
        var name    = $('#vcai-kb-name').val().trim();
        var content = $('#vcai-kb-content').val().trim();
        if (!name || !content) { $('#vcai-kb-result').show().text('⚠️ Nome e contenuto obbligatori.'); return; }

        var $btn = $(this);
        $btn.prop('disabled', true).text('⏳ Salvataggio...');

        $.post(vcai.ajax_url, {
            action: 'vcai_upload_knowledge',
            nonce: vcai.nonce,
            doc_name: name,
            doc_content: content,
        }).done(function (res) {
            if (res.success) {
                $('#vcai-kb-result').show().css('color', '#00a32a').text('✅ ' + res.data.message);
                setTimeout(function () { location.reload(); }, 1000);
            } else {
                $('#vcai-kb-result').show().css('color', '#d63638').text('❌ ' + res.data);
            }
        }).fail(function () {
            $('#vcai-kb-result').show().css('color', '#d63638').text('❌ Errore di connessione.');
        }).always(function () {
            $btn.prop('disabled', false).html('<i class="fa-solid fa-plus"></i> Salva Documento');
        });
    });

    // Elimina documento
    $(document).on('click', '.vcai-kb-delete', function () {
        var name = $(this).data('name');
        if (!confirm('Eliminare il documento "' + name + '"?')) return;

        $.post(vcai.ajax_url, {
            action: 'vcai_delete_knowledge',
            nonce: vcai.nonce,
            doc_name: name,
        }).done(function (res) {
            if (res.success) location.reload();
            else alert('Errore: ' + res.data);
        });
    });

    // Indicizza tutti i post (RAG)
    $('#vcai-index-posts').on('click', function () {
        var $btn = $(this);
        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Indicizzazione...');

        $.post(vcai.ajax_url, {
            action: 'vcai_index_posts',
            nonce: vcai.nonce,
        }).done(function (res) {
            if (res.success) {
                $('#vcai-index-result').show().css('color', '#00a32a').text('✅ ' + res.data.message);
                setTimeout(function () { location.reload(); }, 1500);
            } else {
                $('#vcai-index-result').show().css('color', '#d63638').text('❌ ' + res.data);
            }
        }).fail(function () {
            $('#vcai-index-result').show().css('color', '#d63638').text('❌ Errore di connessione.');
        }).always(function () {
            $btn.prop('disabled', false).html('<i class="fa-solid fa-arrows-rotate"></i> Indicizza tutti i post');
        });
    });
});
