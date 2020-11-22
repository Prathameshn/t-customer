exports.convertToSecond = (duration, durationUnits) => {
   console.log(duration, durationUnits)
   switch (durationUnits) {
      case 'HOURS': return duration * 60 * 60;
      case 'MINUTES': return duration * 60
      case 'SECONDS': return duration
      case 'DAYS': return duration * 24 * 60 * 60
      default: return duration // Invalid TODO Abhimanyu handle other units
   }
}