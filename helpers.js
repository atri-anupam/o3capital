module.exports = {
    netWorthSimulation: function(cashFlow, period, sd) {
    var normalDistribution = [
        -3.99953289e-02,  1.30427035e-01, -1.17613029e-01,  2.69953130e-01,
        -7.41529979e-02,  1.03211865e-01,  1.92046204e-02,  4.74717813e-01,
          1.76096163e-01,  2.61307418e-01, -2.55673419e-01, -2.01363906e-02,
          2.71617663e-01,  3.39038402e-01,  4.68648555e-03,  7.95367122e-02,
        -6.77759046e-02,  6.16081154e-02,  3.33749941e-01,  4.68472991e-01,
          4.06572396e-02,  1.00729792e-01,  8.32242030e-02,  6.60700554e-02,
        -6.58172777e-02,  6.91914674e-02,  1.59234800e-01,  1.94415976e-01,
          1.23153389e-01,  3.20055868e-01, -5.13236867e-02, -5.86664676e-02,
          2.13105514e-01,  1.05226245e-01,  3.35591493e-01, -6.30833310e-02,
          1.48870458e-01,  4.85037812e-01, -1.33678846e-01,  6.19736032e-02,
          1.95989799e-01,  7.32003985e-02,  8.32474961e-02,  1.63255704e-01,
          4.36083540e-02,  2.45922101e-01,  7.86631033e-02, -7.97823252e-02,
        -7.09043768e-02,  1.44140156e-01,  1.79472715e-01,  2.08985648e-01,
          1.25802187e-01,  2.66508484e-01,  2.61366618e-01,  3.99677398e-02,
          5.72816919e-02,  1.08720380e-02,  2.95122691e-01, -1.50055131e-02,
          1.28533359e-01,  2.54351684e-01,  6.19169048e-02,  7.14695723e-02,
          2.23245050e-01,  8.29690908e-02,  1.26185595e-01,  2.45315564e-01,
          2.59016615e-02,  3.24461841e-01,  4.76452599e-01,  2.38552951e-01,
        -4.82760558e-02,  1.30666117e-01,  9.83419184e-02, -1.68869755e-01,
        -2.25964313e-01, -8.23093476e-02,  4.13366356e-01,  2.03572810e-01,
          2.08265861e-01,  1.87470839e-01, -3.45956535e-01,  2.66812953e-01,
        -1.12907277e-01,  2.18001447e-01,  2.64898166e-01,  6.59641421e-02,
          1.95554327e-01, -1.55403223e-01,  1.11611914e-01,  2.64737228e-01,
        -4.08963415e-02,  1.12381893e-01,  4.60774565e-01,  8.38616809e-02,
          2.11837558e-02,  1.86931615e-02, -4.43314270e-02,  1.92665536e-01,
          5.16233929e-01,  1.92338337e-01,  4.00816069e-02, -1.29035325e-02,
          1.26061826e-01,  1.10952618e-01,  3.13413433e-01, -2.00279478e-02,
          3.56736842e-02,  9.67198587e-02,  3.23994483e-01,  1.75662456e-01,
          1.35270089e-01,  4.11342562e-01,  3.10447015e-01, -3.06694330e-02,
          1.30612560e-01,  4.33986900e-03,  1.36478057e-01,  4.35884705e-02,
        -9.75018261e-02,  4.06191574e-01,  3.29568806e-01,  2.44090872e-01,
          1.89774801e-01,  2.69069644e-01, -4.97100235e-02,  1.32746866e-01,
        -1.19950326e-01,  2.56812721e-01,  3.69812532e-01,  1.08916470e-01,
        -5.78446998e-02,  2.19426787e-01,  2.35193459e-01,  1.54571144e-01,
          3.51119430e-01,  6.89624085e-02,  2.21684816e-01,  4.51901693e-01,
          2.80754090e-01,  4.76897078e-01,  3.42141044e-01,  1.07184589e-01,
          4.66469146e-01,  2.07091443e-01,  4.17838010e-05,  5.49816718e-01,
          3.54707984e-01, -1.50707356e-02,  6.16508058e-01,  1.34543392e-01,
          5.30985848e-02,  3.02507946e-01,  1.80814662e-01,  4.03639124e-01,
          1.72971447e-01,  2.54116722e-01,  4.37572556e-02,  1.35964324e-01,
          5.24057969e-01, -1.37616826e-02, -9.97112103e-02,  2.86597397e-02,
          2.96841727e-02,  3.73386234e-01,  3.62556891e-01,  4.09182148e-02,
          2.64953094e-01,  3.80535853e-01,  9.71542705e-02,  2.75500894e-02,
        -7.75145637e-02, -5.21829435e-02,  1.74890852e-01,  2.33901668e-01,
          3.30099508e-02,  1.28841007e-01,  4.91457606e-02, -8.91871379e-02,
          1.20009532e-01, -2.38087894e-01,  2.35100770e-01,  9.40172129e-02,
          2.28863434e-01,  1.24752650e-01,  2.31461660e-01, -8.19285893e-02,
          3.67270845e-01,  3.73740520e-01,  1.07800622e-01,  1.55555921e-01,
          4.22769553e-01,  2.94053088e-01,  1.16604694e-01,  1.26146783e-01,
        -9.88435952e-02,  1.40212273e-01,  2.59496172e-01,  2.08709944e-01
      ];
      console.log("cashflow is"+ cashFlow);
      console.log("period is"+ period);
      var netWorth = cashFlow[0];
      for(let i=0; i<period; i++) {
        var randNumber = (Math.floor(Math.random() * 200) + 1);
        var z = normalDistribution[randNumber];
        if(cashFlow[i] > 0) {
          netWorth = (netWorth*(1+z)) + cashFlow[i];
        }
        if(cashFlow[i] < 0) {
          netWorth = (netWorth*(1+ 0.09)) + cashFlow[i];
        }
      }
      return netWorth;
    }
  };