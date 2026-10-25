<?php

class Twig_Extensions_Extension_Tinyboard extends Twig_Extension
{
	/**
	* Returns a list of filters to add to the existing list.
	*
	* @return array An array of filters
	*/
	public function getFilters()
	{
		return array(
			new Twig_SimpleFilter('filesize', 'format_bytes'),
			new Twig_SimpleFilter('truncate', 'twig_truncate_filter'),
			new Twig_SimpleFilter('truncate_body', 'truncate'),
			new Twig_SimpleFilter('extension', 'twig_extension_filter'),
			new Twig_SimpleFilter('sprintf', 'sprintf'),
			new Twig_SimpleFilter('capcode', 'capcode'),
			new Twig_SimpleFilter('hasPermission', 'twig_hasPermission_filter'),
			new Twig_SimpleFilter('date', 'twig_date_filter'),
			new Twig_SimpleFilter('poster_id', 'poster_id'),
			new Twig_SimpleFilter('remove_whitespace', 'twig_remove_whitespace_filter'),
			new Twig_SimpleFilter('count', 'count'),
			new Twig_SimpleFilter('ago', 'ago'),
			new Twig_SimpleFilter('until', 'until'),
			new Twig_SimpleFilter('push', 'twig_push_filter'),
			new Twig_SimpleFilter('bidi_cleanup', 'bidi_cleanup'),
			new Twig_SimpleFilter('addslashes', 'addslashes')
		);
	}
	
	/**
	* Returns a list of functions to add to the existing list.
	*
	* @return array An array of filters
	*/
	public function getFunctions()
	{
		return array(
			new Twig_SimpleFunction('time', 'time'),
			new Twig_SimpleFunction('floor', 'floor'),
			new Twig_SimpleFunction('timezone', 'twig_timezone_function'),
			new Twig_SimpleFunction('hiddenInputs', 'hiddenInputs'),
			new Twig_SimpleFunction('hiddenInputsHash', 'hiddenInputsHash'),
		);
	}
	
	/**
	* Returns the name of the extension.
	*
	* @return string The extension name
	*/
	public function getName()
	{
		return 'tinyboard';
	}
}

function twig_timezone_function() {
	return 'Z';
}

function twig_push_filter($array, $value) {
	array_push($array, $value);
	return $array;
}

function twig_remove_whitespace_filter($data) {
	return preg_replace('/[\t\r\n]/', '', $data);
}

function twig_date_filter($date, $format) {
	// strftime()/gmstrftime() are deprecated as of PHP 8.1 and will be removed
	// in PHP 9.0. On versions where gmstrftime() still exists, use it directly:
	// it reproduces the platform's strftime() semantics exactly (including
	// locale-aware specifiers like %c, %D, %x, %X, %Z). On newer versions we
	// fall back to a portable gmdate()-based converter that covers every
	// specifier documented on php.net/function.strftime.
	if (function_exists('gmstrftime')) {
		$tz = date_default_timezone_get();
		date_default_timezone_set('UTC');
		$out = @gmstrftime($format, (int)$date);
		date_default_timezone_set($tz);
		return $out;
	}

	return twig_strftime_fallback((int)$date, $format);
}

function twig_strftime_fallback($ts, $format) {
	// Portable gmdate()-based strftime() emulation, used only when gmstrftime()
	// has been removed from PHP. Values match C/glibc conventions.
	static $directMap = array(
		// Weekday
		'%a' => 'D', '%A' => 'l', '%u' => 'N', '%w' => 'w',
		// Day of month / ISO date
		'%d' => 'd', '%F' => 'Y-m-d',
		// Month
		'%b' => 'M', '%B' => 'F', '%h' => 'M', '%m' => 'm',
		// Year
		'%y' => 'y', '%Y' => 'Y',
		// Time
		'%H' => 'H', '%I' => 'h', '%M' => 'i', '%S' => 's',
		'%p' => 'A', '%P' => 'a', '%r' => 'h:i:s A', '%R' => 'H:i',
		'%T' => 'H:i:s',
		// Timezone offset (the filter formats in UTC) /
		// epoch seconds / whitespace / literal percent
		'%z' => '+0000',
		'%s' => 'U', '%n' => "\n", '%t' => "\t", '%%' => '%',
	);

	$tokens = array();

	// All components are derived from gmdate(): the filter formats in UTC, so the
	// server's timezone setting must never leak into these values.
	list($year, $mon, $day, $hour, $yday, $dow) = array_map('intval', explode('|', gmdate('Y|n|j|G|z|w', $ts)));
	$hour12 = $hour % 12; if ($hour12 === 0) $hour12 = 12;
	$hms    = gmdate('H:i:s', $ts);
	$mdy    = sprintf('%02d/%02d/%02d', $mon, $day, $year % 100);

	// Replace ALL occurrences of a specifier with a sentinel token.
	$tokenize = function ($spec, $value) use (&$format, &$tokens) {
		while (($pos = strpos($format, $spec)) !== false) {
			$token = "\x01" . count($tokens) . "\x02";
			$format = substr_replace($format, $token, $pos, 2);
			$tokens[$token] = $value;
		}
	};

	// Space-padded values.
	if (strpos($format, '%e') !== false || strpos($format, '%c') !== false)
		$tokenize('%e', str_pad((string)$day, 2, ' ', STR_PAD_LEFT));
	if (strpos($format, '%k') !== false)
		$tokenize('%k', str_pad((string)$hour, 2, ' ', STR_PAD_LEFT));
	if (strpos($format, '%l') !== false)
		$tokenize('%l', str_pad((string)$hour12, 2, ' ', STR_PAD_LEFT));

	// %E and %O are glibc modifiers that only make sense combined with other
	// specifiers (%_d, %0d, %Od...); gmstrftime() does not support them on their
	// own and leaves them as literals, so we keep exactly the same behaviour.

	// Day of year, zero-padded.
	if (strpos($format, '%j') !== false)
		$tokenize('%j', sprintf('%03d', $yday + 1));

	// Calendar week numbers: %U counts weeks starting on Sunday, %W on Monday.
	// Days before the year's first Sunday/Monday belong to week 00. Matches the
	// glibc strftime() formulas exactly: U = (yday + 7 - dow_sun) / 7 and
	// W = (yday + 7 - dow_mon) / 7 with integer division ($dow is 0 = Sunday
	// from gmdate('w'), purely calendar arithmetic, timezone-independent).
	if (strpos($format, '%U') !== false) {
		$tokenize('%U', sprintf('%02d', intdiv($yday + 7 - $dow, 7)));
	}
	if (strpos($format, '%W') !== false) {
		$dowMon = ($dow + 6) % 7; // 0 = Monday
		$tokenize('%W', sprintf('%02d', intdiv($yday + 7 - $dowMon, 7)));
	}

	// ISO-8601 pieces: %V week number, %G week-numbering year, %g its last two
	// digits, %C the century of the week-numbering year.
	if (strpos($format, '%V') !== false || strpos($format, '%G') !== false
			|| strpos($format, '%g') !== false || strpos($format, '%C') !== false) {
		$isoYear = (int)gmdate('o', $ts);
		if (strpos($format, '%V') !== false)
			$tokenize('%V', gmdate('W', $ts));
		if (strpos($format, '%G') !== false)
			$tokenize('%G', sprintf('%04d', $isoYear));
		if (strpos($format, '%g') !== false)
			$tokenize('%g', sprintf('%02d', (($isoYear % 100) + 100) % 100));
		if (strpos($format, '%C') !== false)
			// glibc computes %C from the calendar year, not the week-numbering year.
			$tokenize('%C', sprintf('%02d', intval(floor($year / 100))));
	}

	// Locale composites, approximated per glibc/C locale.
	if (strpos($format, '%D') !== false || strpos($format, '%x') !== false) {
		// %D is "%m/%d/%y"; %x matches it in the C/US locale.
		$tokenize('%D', $mdy);
		$tokenize('%x', $mdy);
	}
	if (strpos($format, '%X') !== false)
		$tokenize('%X', $hms); // equivalent to %T
	if (strpos($format, '%c') !== false) {
		// glibc's %c is "%a %b %e %T %Y".
		$tokenize('%c', gmdate('D M', $ts) . ' ' . str_pad((string)$day, 2, ' ', STR_PAD_LEFT) . ' ' . $hms . ' ' . sprintf('%04d', $year));
		// Any explicit %e was already tokenized above; make sure it never leaks
		// into this expansion unexpanded when %c appears without %e handling.
	}
	if (strpos($format, '%Z') !== false) {
		// The output is formatted in UTC; glibc labels that zone "GMT". Fall back
		// to a literal UTC if gmstrftime() is unavailable for probing.
		$tzName = function_exists('gmstrftime') ? @gmstrftime('%Z', $ts) : false;
		$tokenize('%Z', ($tzName === false || $tzName === '') ? 'UTC' : $tzName);
	}

	// Translate the remaining specifiers to gmdate() format, escaping literals.
	$converted = '';
	$length = strlen($format);
	for ($i = 0; $i < $length; $i++) {
		if ($format[$i] === '%' && $i + 1 < $length) {
			$spec = '%' . $format[$i + 1];
			if (isset($directMap[$spec])) {
				$converted .= $directMap[$spec];
				$i++;
				continue;
			}
		}
		// Escape literal characters (and any unknown specifiers) for gmdate().
		if (ctype_alnum($format[$i])) {
			$converted .= '\\' . $format[$i];
		} else {
			$converted .= $format[$i];
		}
	}

	$out = gmdate($converted, $ts);

	foreach ($tokens as $token => $value) {
		$out = str_replace($token, $value, $out);
	}

	return $out;
}

function twig_hasPermission_filter($mod, $permission, $board = null) {
	return hasPermission($permission, $board, $mod);
}

function twig_extension_filter($value, $case_insensitive = true) {
	$ext = mb_substr($value, mb_strrpos($value, '.') + 1);
	if($case_insensitive)
		$ext = mb_strtolower($ext);		
	return $ext;
}

function twig_sprintf_filter( $value, $var) {
	return sprintf($value, $var);
}

function twig_truncate_filter($value, $length = 30, $preserve = false, $separator = '…') {
	if (mb_strlen($value) > $length) {
		if ($preserve) {
			if (false !== ($breakpoint = mb_strpos($value, ' ', $length))) {
				$length = $breakpoint;
			}
		}
		return mb_substr($value, 0, $length) . $separator;
	}
	return $value;
}

