jsDiff = (function(config){
	
	// Regular expression for convert input strings in the internal format for comparison
	var regToReplace = /([\s]{2,})+/ig;
	
	// Global library config
	var config = {
		ignoreTab: false,
		enterSymbol: "\n"
	}
	
	// Processed set of strings from input files
	var sourceFiles = {'first': [], 'second': []};
	var files = {'first': [], 'second': []};
	
	/*
		Set of records on strings, which includes both the first and second files
			id 			: id of sequence
			firstStart 	: number of start string of this sequence in first file
			secondStart	: number of start string of this sequence in second file
			'length'	: length of the sequence
	*/
	var sequences = {};
	
	var indexOfSequences = 1;
	
	// The optimal set of sequences that are in both files - sequences ids
	var finalSetOfSequences = {};
	
	/*
		Final set of strings, which contains strings from both files, including labels of changes
		Format:
			string			: string
			positions: 		
				first: 
				second: 
			action:	
	*/
	var resultFile = [];
	
	
	// Main function
	function load(_config)
	{
		
		for (key in _config)
			if (key in config)
				config[key] = _config[key];
				
		sourceFiles = {
			'first': _config.first.split( config.enterSymbol ),
			'second': _config.second.split( config.enterSymbol )
		};
		
		for (i = 0, len = sourceFiles.first.length; i < len; i++)
			files.first[i] = getHashFromString(sourceFiles.first[i]);
			
		for (i = 0, len = sourceFiles.second.length; i < len; i++)
			files.second[i] = getHashFromString(sourceFiles.second[i]);
		
		delete _config;
		//alert(files.first.toSource());
				
		setSequences();
		//alert(sequences.toSource());
		setFinalSetOfSequences();
		//alert(finalSetOfSequences.toSource());
		
		setResultFile();
		//alert(resultFile.toSource());
	}
	
	function getHashFromString(str)
	{
		str = str.replace(this.regToReplace, '');
		/*if (config.ignoreTab === true)
			str = trim(str);
			*/
		return str;
	}
	
	
	// Get sequences from files
	function setSequences()
	{
		var indexOfSequences = 1;
		// format: <number of the string from first file>:<number of the string from second file> => index of sequence
		var belonging = {};
		
		for (i = 0, fLen = files.first.length; i < fLen; i++)
			for (j = 0, sLen = files.second.length; j < sLen; j++)
				if (files.first[i] == files.second[j]){
				
					/*
						first file		seconf file
						....			....
						a (before)	?	a (before)
						b (current)		b (current)
						....			....
					*/
					if (belonging[ (i - 1) + ':' + (j - 1) ]){
					
						_index = belonging[ (i - 1) + ':' + (j - 1) ];
						belonging[ i + ':' + j ] = _index;
						sequences[_index].length++;
						
					}else{
						
						belonging[ i + ':' + j ] = indexOfSequences;
						sequences[indexOfSequences] = {
							'id': indexOfSequences,
							'firstStart': i,
							'secondStart': j,
							'length': 1
						};
						indexOfSequences++;
					}
				}
		delete belonging;
		delete files;
	}
	
	
	function setFinalSetOfSequences()
	{
		var nullSequence = {'id': 0, 'firstStart': 0, 'secondStart': 0, 'length': 0};
		var setOfSequences = compare(nullSequence);
		// delete last element - nullSequence
		setOfSequences.ids.pop();
		
		finalSetOfSequences = setOfSequences;
	}
	
	/*
		Recursive function.
		Getting optimized result for sequnces, which locate after this sequence - after position on first file and after position on second file
		
		format of the input and output data of this function:
			count: 		count strings, which is in both files, after this sequnce
			ids:		ids of this strings
	*/
	
	
	function compare(sequence)
	{
		var afterFirst = sequence.firstStart + sequence.length;
		var afterSecond = sequence.secondStart + sequence.length;
		
		var _result = {'count': 0, 'ids': []};
		var _count = 0;
		for (i in sequences){
			
			if (sequences[i].firstStart >= afterFirst && sequences[i].secondStart >= afterSecond){
				var _res = compare(sequences[i]);
				
				if (_res.count > _count){
					_result = _res;
					_count = _res.count;
				}
			}
		}
		
		_result.ids.push(sequence.id);
		return {'count': _result.count + sequence.length, 'ids': _result.ids};
	}
	
	
	_recordsOfSequences = {'first': [], 'second': [], 'startToCount': {}};
	
	function setResultFile()
	{
		var ids = finalSetOfSequences.ids;
		
		for (i = 0, len = ids.length; i < len; i++){
			var id = ids.pop();
			if (id == 0 || !sequences[id])
				continue;
			
			_recordsOfSequences.first.push( sequences[id].firstStart );
			_recordsOfSequences.startToCount[ sequences[id].firstStart ] = sequences[id].length;
			
			_recordsOfSequences.second.push( sequences[id].secondStart );
		}
		
		// set params for strings, which after last sequence
		_recordsOfSequences.first.push( sourceFiles.first.length );
		_recordsOfSequences.startToCount[ sourceFiles.first.length ] = 0;
		_recordsOfSequences.second.push( sourceFiles.second.length );
		
		_recordsOfSequences.first.sort(sortByAsc);
		_recordsOfSequences.second.sort(sortByAsc);
		
		setResultItem(0, 0, true);
	}
	
	function sortByAsc(i1, i2) {
		i1 = parseInt(i1);
		i2 = parseInt(i2)
		if (i1 > i2)
			return 1;
		else if (i1 < i2)
			return -1;
		else
			return 0;
	}
	
	/*
		Step by step function. Render strings beetween begin of range and begin of immediate sequence of unmodified strings + this sequence 
		and start next function with params for next range.
	*/
	function setResultItem(firstStartRange, secondStartRange, isNext)
	{
		firstStartSequence = _recordsOfSequences.first.shift();
		secondStartSequence = _recordsOfSequences.second.shift();
		
		var count = _recordsOfSequences.startToCount[firstStartSequence];
		
		for (i = firstStartRange; i < firstStartSequence; i++)
			resultFile.push({
				'string': sourceFiles.first[i],
				'positions': {
					'first': i + 1,
					'second': 0
				},
				'action': '-'
			});
			
		for (i = secondStartRange; i < secondStartSequence; i++)
			resultFile.push({
				'string': sourceFiles.second[i],
				'positions': {
					'first': 0,
					'second': i + 1
				},
				'action': '+'
			});
			
		for (i = secondStartSequence, cnt = 0; i < secondStartSequence + count; i++, cnt++)
			resultFile.push({
				'string': sourceFiles.second[i],
				'positions': {
					'first': firstStartSequence + cnt + 1,
					'second': i + 1
				},
				'action': ''
			});
			
		if (isNext){
			setResultItem(firstStartSequence + count, secondStartSequence + count, _recordsOfSequences.first.length > 0);
		}
	}
	
    return {
       load: function (config) {
           load(config);
		   return resultFile;
       },
    };
})();