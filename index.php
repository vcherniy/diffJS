<script src="jquery.js" type="text/javascript"></script>
<script>
function cl()
{
	res = jsDiff.load({
		first:  $('#first').val(),
		second: $('#second').val()
	});
	
	//$('#tbl').empty();
	
	while (item = res.shift()){
		bf = $('#tr').clone();
		bf.attr('id', '');
		bf.css('display', 'table-row');
		bf.find('.nf').text(item.positions.first);
		bf.find('.ns').text(item.positions.second);
		bf.find('.ac').text(item.action);
		bf.find('.str').text(item.string);
		bf.appendTo('#tbl');
	}
	
}
</script>
<textarea id="first" cols="40" rows="20"></textarea>
<textarea id="second" cols="40" rows="20"></textarea>

<div onclick="cl();">SEND</div>

<table id="tbl" width="600">
	<tr id="tr" style="display: none;">
		<td class="nf" width="40"></td>
		<td class="ns" width="40"></td>
		<td class="ac" width="40"></td>
		<td class="str"></td>
	</tr>
</table>